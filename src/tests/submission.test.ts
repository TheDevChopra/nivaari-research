import { describe, it, expect, beforeEach } from 'vitest';
import { buildSubmissionPayload, submitResearchResponse } from '../lib/research/submission';
import { ConsentState } from '../types/research';

describe('Submission Pipeline & Privacy Isolation', () => {
  beforeEach(() => {
    // Mock sessionStorage for Node environment
    const storage: Record<string, string> = {};
    (globalThis as any).sessionStorage = {
      getItem: (k: string) => storage[k] || null,
      setItem: (k: string, v: string) => {
        storage[k] = v;
      },
      removeItem: (k: string) => {
        delete storage[k];
      },
      clear: () => {
        for (const k of Object.keys(storage)) delete storage[k];
      },
      length: 0,
      key: () => null,
    };
  });

  const sampleConsents: ConsentState = {
    consent_age: true,
    consent_research: true,
    consent_sensitive_data: true,
    consent_contact: true,
    consent_updates: false,
  };

  const sampleAnswers = {
    A00: 'Ananya Sharma',
    A01: '25-29',
    A04: 'predictable',
    B01: 'period_app',
    C01: ['cramps_pain'],
    C03: 3,
    H01: 'Ananya Sharma',
    H02: 'ananya@example.com',
    H03: '+91 99999 88888',
    H04: 'yes',
    H05: 'no',
  };

  it('separates contact information from research health answers', () => {
    const payload = buildSubmissionPayload(
      'test-uuid-1',
      '2026-11-04T10:00:00.000Z',
      sampleAnswers,
      sampleConsents
    );

    // Verify contact block is populated
    expect(payload.contact).toBeDefined();
    expect(payload.contact?.name).toBe('Ananya Sharma');
    expect(payload.contact?.email).toBe('ananya@example.com');
    expect(payload.contact?.phone).toBe('+91 99999 88888');
    expect(payload.contact?.contact_permission).toBe(true);
    expect(payload.contact?.updates_permission).toBe(false);

    // Verify contact questions (including A00 Full Name) are NOT in the research answers array
    const answerQuestionIds = payload.answers.map((a) => a.question_id);
    expect(answerQuestionIds).not.toContain('A00');
    expect(answerQuestionIds).not.toContain('H01');
    expect(answerQuestionIds).not.toContain('H02');
    expect(answerQuestionIds).not.toContain('H03');
    expect(answerQuestionIds).not.toContain('H04');
    expect(answerQuestionIds).not.toContain('H05');

    // Health answers remain intact
    expect(answerQuestionIds).toContain('A01');
    expect(answerQuestionIds).toContain('A04');
    expect(answerQuestionIds).toContain('B01');
    expect(answerQuestionIds).toContain('C01');
    expect(answerQuestionIds).toContain('C03');

    // Points earned is recorded (5 answered health research questions * 5 = 25 points)
    expect(payload.points_earned).toBe(25);
  });

  it('records versioned consent flags and timestamps', () => {
    const payload = buildSubmissionPayload(
      'test-uuid-2',
      '2026-11-04T10:00:00.000Z',
      sampleAnswers,
      sampleConsents
    );

    expect(payload.consent.age_confirmed).toBe(true);
    expect(payload.consent.research_granted).toBe(true);
    expect(payload.consent.sensitive_data_granted).toBe(true);
    expect(payload.consent.notice_version).toBeDefined();
    expect(payload.survey_version).toBe('founding_100_v1');
  });

  it('handles local dev fallback submission gracefully', async () => {
    const payload = buildSubmissionPayload(
      'test-uuid-3',
      '2026-11-04T10:00:00.000Z',
      sampleAnswers,
      sampleConsents
    );

    const result = await submitResearchResponse(payload);
    expect(result.success).toBe(true);
    expect(result.responseId).toBe('test-uuid-3');
  });

  it('prevents duplicate submissions with identical response_id', async () => {
    const payload = buildSubmissionPayload(
      'test-uuid-4',
      '2026-11-04T10:00:00.000Z',
      sampleAnswers,
      sampleConsents
    );

    const firstSubmit = await submitResearchResponse(payload);
    expect(firstSubmit.success).toBe(true);
    expect(firstSubmit.duplicate).toBeUndefined();

    // Second submit should detect duplicate
    const secondSubmit = await submitResearchResponse(payload);
    expect(secondSubmit.success).toBe(true);
    expect(secondSubmit.duplicate).toBe(true);
  });
});
