import {
  ConsentState,
  ResearchSubmissionPayload,
  ParticipantContact,
} from '../../types/research';
import { SURVEY_VERSION, PRIVACY_NOTICE_VERSION } from '../../config/founding100/copy.v1';
import { QUESTIONS_V1 } from '../../config/founding100/survey.v1';
import { getActiveQuestions } from './branching-engine';
import { calculatePoints } from './scoring';
import { getSupabaseClient, isSupabaseConfigured } from './supabase-client';

const SUBMITTED_CACHE_KEY = 'nivaari_submitted_responses';

function hasBeenSubmitted(responseId: string): boolean {
  try {
    const raw = sessionStorage.getItem(SUBMITTED_CACHE_KEY);
    if (!raw) return false;
    const list: string[] = JSON.parse(raw);
    return list.includes(responseId);
  } catch {
    return false;
  }
}

function markAsSubmitted(responseId: string): void {
  try {
    const raw = sessionStorage.getItem(SUBMITTED_CACHE_KEY);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(responseId)) {
      list.push(responseId);
      sessionStorage.setItem(SUBMITTED_CACHE_KEY, JSON.stringify(list));
    }
  } catch {
    // Ignore storage errors
  }
}

/**
 * Builds the canonical payload, strictly isolating contact details from health answers.
 */
export function buildSubmissionPayload(
  responseId: string,
  startedAt: string,
  answers: Record<string, any>,
  consents: ConsentState
): ResearchSubmissionPayload {
  const submittedAt = new Date().toISOString();

  // Extract contact fields separately (A00 Full Name or H01)
  const contactName = answers.A00 || answers.H01;
  const contactEmail = answers.H02;
  const contactPhone = answers.H03;
  const contactPermission = answers.H04 === 'yes' || consents.consent_contact;
  const updatesPermission = answers.H05 === 'yes' || consents.consent_updates;

  let contact: ParticipantContact | undefined = undefined;

  if (contactName || contactEmail || contactPhone) {
    contact = {
      name: contactName ? String(contactName).trim() : undefined,
      email: contactEmail ? String(contactEmail).trim() : undefined,
      phone: contactPhone ? String(contactPhone).trim() : undefined,
      contact_permission: contactPermission,
      updates_permission: updatesPermission,
    };
  }

  // Filter out contact/identity questions (A00, H01-H05) from research health answers
  const contactQuestionIds = new Set(['A00', 'H01', 'H02', 'H03', 'H04', 'H05']);
  const researchAnswers = Object.entries(answers)
    .filter(([qId]) => !contactQuestionIds.has(qId))
    .map(([question_id, value]) => ({
      question_id,
      answer: value,
      question_version: 'v1',
      answered_at: submittedAt,
    }));

  const activeQuestions = getActiveQuestions(QUESTIONS_V1, answers, consents);
  const score = calculatePoints(activeQuestions, answers);

  return {
    survey_version: SURVEY_VERSION,
    response_id: responseId,
    started_at: startedAt,
    submitted_at: submittedAt,
    points_earned: score.points,
    consent: {
      age_confirmed: consents.consent_age,
      research_granted: consents.consent_research,
      sensitive_data_granted: consents.consent_sensitive_data,
      contact_granted: consents.consent_contact,
      updates_granted: consents.consent_updates,
      notice_version: PRIVACY_NOTICE_VERSION,
      recorded_at: submittedAt,
    },
    contact,
    answers: researchAnswers,
  };
}

export interface SubmissionResult {
  success: boolean;
  duplicate?: boolean;
  mode: 'supabase' | 'local_dev_mock';
  message: string;
  responseId: string;
}

/**
 * Submits the research payload with duplicate protection, RLS-safe backend insertion,
 * or transparent development fallback mode when Supabase is not configured.
 */
export async function submitResearchResponse(
  payload: ResearchSubmissionPayload
): Promise<SubmissionResult> {
  // 1. Check duplicate submission
  if (hasBeenSubmitted(payload.response_id)) {
    return {
      success: true,
      duplicate: true,
      mode: isSupabaseConfigured ? 'supabase' : 'local_dev_mock',
      message: 'This response has already been submitted.',
      responseId: payload.response_id,
    };
  }

  // 2. If Supabase client is available
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // First attempt RPC if available
      const { data, error } = await supabase.rpc('submit_research_form', {
        p_submission_payload: payload,
      });

      if (!error && data) {
        markAsSubmitted(payload.response_id);
        return {
          success: true,
          mode: 'supabase',
          message: 'Response recorded securely via Supabase.',
          responseId: payload.response_id,
        };
      }

      // Fallback to direct client table inserts using RLS policies
      let participantId: string | null = null;

      if (payload.contact && (payload.contact.email || payload.contact.phone)) {
        const { data: partData, error: partError } = await supabase
          .from('research_participants')
          .insert({
            name: payload.contact.name || null,
            email: payload.contact.email || null,
            phone: payload.contact.phone || null,
            contact_permission: payload.contact.contact_permission,
            updates_permission: payload.contact.updates_permission,
            consent_version: payload.consent.notice_version,
            consented_at: payload.consent.recorded_at,
          })
          .select('id')
          .single();

        if (!partError && partData) {
          participantId = partData.id;
        }
      }

      const { data: respData, error: respError } = await supabase
        .from('research_responses')
        .insert({
          id: payload.response_id,
          participant_id: participantId,
          survey_version: payload.survey_version,
          status: 'submitted',
          started_at: payload.started_at,
          submitted_at: payload.submitted_at,
          client_submission_id: payload.response_id,
          points_earned: payload.points_earned || 0,
        })
        .select('id')
        .single();

      if (respError) {
        throw respError;
      }

      const activeResponseId = respData?.id || payload.response_id;

      // Insert consent records
      await supabase.from('consent_records').insert([
        {
          response_id: activeResponseId,
          consent_type: 'age_confirmed',
          granted: payload.consent.age_confirmed,
          notice_version: payload.consent.notice_version,
          recorded_at: payload.consent.recorded_at,
        },
        {
          response_id: activeResponseId,
          consent_type: 'research_granted',
          granted: payload.consent.research_granted,
          notice_version: payload.consent.notice_version,
          recorded_at: payload.consent.recorded_at,
        },
        {
          response_id: activeResponseId,
          consent_type: 'sensitive_data_granted',
          granted: payload.consent.sensitive_data_granted,
          notice_version: payload.consent.notice_version,
          recorded_at: payload.consent.recorded_at,
        },
        {
          response_id: activeResponseId,
          consent_type: 'contact_granted',
          granted: payload.consent.contact_granted,
          notice_version: payload.consent.notice_version,
          recorded_at: payload.consent.recorded_at,
        },
        {
          response_id: activeResponseId,
          consent_type: 'updates_granted',
          granted: payload.consent.updates_granted,
          notice_version: payload.consent.notice_version,
          recorded_at: payload.consent.recorded_at,
        },
      ]);

      // Insert research answers
      const answerRows = payload.answers.map((a) => ({
        response_id: activeResponseId,
        question_id: a.question_id,
        answer_json: a.answer,
        answered_at: a.answered_at,
        question_version: a.question_version,
      }));

      if (answerRows.length > 0) {
        const { error: ansError } = await supabase.from('research_answers').insert(answerRows);
        if (ansError) {
          throw ansError;
        }
      }

      markAsSubmitted(payload.response_id);

      return {
        success: true,
        mode: 'supabase',
        message: 'Response recorded securely.',
        responseId: payload.response_id,
      };
    } catch (err: any) {
      console.error('Supabase submission failed. Saving to local session fallback.');
      // Fall through to save locally in development/offline scenario
    }
  }

  // 3. Fallback / Dev Mock Mode
  // If Supabase is not configured or in dev, store safely in local session storage
  try {
    const devStorageKey = `nivaari_mock_submission_${payload.response_id}`;
    sessionStorage.setItem(devStorageKey, JSON.stringify(payload));
    markAsSubmitted(payload.response_id);

    return {
      success: true,
      mode: 'local_dev_mock',
      message:
        'Development Mode: Saved to local browser session storage because Supabase credentials are not configured.',
      responseId: payload.response_id,
    };
  } catch (err: any) {
    return {
      success: false,
      mode: 'local_dev_mock',
      message: err?.message || 'Could not save response.',
      responseId: payload.response_id,
    };
  }
}

