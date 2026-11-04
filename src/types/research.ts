export type QuestionType =
  | 'single_select'
  | 'multi_select'
  | 'short_text'
  | 'long_text'
  | 'scale'
  | 'email'
  | 'phone'
  | 'yes_no';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
  isMutuallyExclusive?: boolean;
  hasOtherInput?: boolean;
}

export interface ScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface Question {
  id: string;
  sectionId: SectionId;
  sectionTitle: string;
  prompt: string;
  helperText?: string;
  placeholder?: string;
  type: QuestionType;
  required?: boolean;
  options?: QuestionOption[];
  maxSelectable?: number;
  scaleConfig?: ScaleConfig;
  condition?: (answers: Record<string, any>, consents: ConsentState) => boolean;
  isParticipantContact?: boolean;
}

export type SectionId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H';

export interface SectionMeta {
  id: SectionId;
  number: string;
  title: string;
  description?: string;
}

export interface ConsentState {
  consent_age: boolean;
  consent_research: boolean;
  consent_sensitive_data: boolean;
  consent_contact: boolean;
  consent_updates: boolean;
}

export interface StoredAnswer {
  question_id: string;
  value: any;
  other_text?: string;
  answered_at: string;
}

export interface ParticipantContact {
  name?: string;
  email?: string;
  phone?: string;
  contact_permission: boolean;
  updates_permission: boolean;
}

export interface ResearchSubmissionPayload {
  survey_version: string;
  response_id: string;
  started_at: string;
  submitted_at: string;
  consent: {
    age_confirmed: boolean;
    research_granted: boolean;
    sensitive_data_granted: boolean;
    contact_granted: boolean;
    updates_granted: boolean;
    notice_version: string;
    recorded_at: string;
  };
  contact?: ParticipantContact;
  points_earned?: number;
  answers: Array<{
    question_id: string;
    answer: any;
    question_version: string;
    answered_at: string;
  }>;
}

export type SurveyStep =
  | { type: 'welcome' }
  | { type: 'consent' }
  | { type: 'ineligible' }
  | { type: 'question'; questionId: string }
  | { type: 'review' }
  | { type: 'submitting' }
  | { type: 'thank_you' }
  | { type: 'error'; message: string };

