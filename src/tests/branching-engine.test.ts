import { describe, it, expect } from 'vitest';
import {
  getActiveQuestions,
  pruneInactiveAnswers,
  getNextQuestionId,
  getPreviousQuestionId,
  handleMultiSelectChange,
  validateAnswer,
} from '../lib/research/branching-engine';
import { QUESTIONS_V1 } from '../config/founding100/survey.v1';
import { ConsentState } from '../types/research';

const baseConsents: ConsentState = {
  consent_age: true,
  consent_research: true,
  consent_sensitive_data: true,
  consent_contact: false,
  consent_updates: false,
};

describe('Branching Engine — Section A (Menstrual Experience)', () => {
  it('skips A05 and A06 when periods are predictable', () => {
    const answers = { A01: '25-29', A04: 'predictable' };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const activeIds = active.map((q) => q.id);

    expect(activeIds).toContain('A04');
    expect(activeIds).not.toContain('A05');
    expect(activeIds).not.toContain('A06');
    expect(activeIds).toContain('B01');
  });

  it('shows A05 when cycle is unpredictable, vary, or recent_change', () => {
    ['vary', 'unpredictable', 'recent_change'].forEach((value) => {
      const answers = { A04: value };
      const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
      const activeIds = active.map((q) => q.id);

      expect(activeIds).toContain('A05');
      expect(activeIds).not.toContain('A06');
    });
  });

  it('shows A06 when participant does not currently get periods', () => {
    const answers = { A04: 'no_periods' };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const activeIds = active.map((q) => q.id);

    expect(activeIds).not.toContain('A05');
    expect(activeIds).toContain('A06');
  });
});

describe('Branching Engine — Section B (Tracking Setup)', () => {
  it('app users see B02 (app name) and subsequent tracker questions', () => {
    const answers = { B01: 'period_app' };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const activeIds = active.map((q) => q.id);

    expect(activeIds).toContain('B02');
    expect(activeIds).toContain('B03');
    expect(activeIds).toContain('B04');
    expect(activeIds).toContain('B05');
    expect(activeIds).not.toContain('B06');
    expect(activeIds).not.toContain('B07');
  });

  it('calendar / notes users skip B02 (app name) but see B03, B04, B05', () => {
    const answers = { B01: 'phone_calendar' };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const activeIds = active.map((q) => q.id);

    expect(activeIds).not.toContain('B02');
    expect(activeIds).toContain('B03');
    expect(activeIds).toContain('B04');
    expect(activeIds).toContain('B05');
    expect(activeIds).not.toContain('B06');
    expect(activeIds).not.toContain('B07');
  });

  it('non-trackers see B06 and B07 and skip B02..B05, B08', () => {
    const answers = { B01: 'do_not_track' };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const activeIds = active.map((q) => q.id);

    expect(activeIds).not.toContain('B02');
    expect(activeIds).not.toContain('B03');
    expect(activeIds).not.toContain('B04');
    expect(activeIds).not.toContain('B05');
    expect(activeIds).toContain('B06');
    expect(activeIds).toContain('B07');
    expect(activeIds).not.toContain('B08');
  });

  it('shows B08 only when tracker user has considered or switched', () => {
    const answersActive = { B01: 'period_app', B05: 'stopped_using' };
    const activeIdsActive = getActiveQuestions(QUESTIONS_V1, answersActive, baseConsents).map((q) => q.id);
    expect(activeIdsActive).toContain('B08');

    const answersHappy = { B01: 'period_app', B05: 'happy_with_current' };
    const activeIdsHappy = getActiveQuestions(QUESTIONS_V1, answersHappy, baseConsents).map((q) => q.id);
    expect(activeIdsHappy).not.toContain('B08');
  });
});

describe('Branching Engine — Section C (Symptoms and Impact)', () => {
  it('skips C02, C03, C04 when participant selects none_of_these or prefer_not', () => {
    const answersNone = { C01: ['none_of_these'] };
    const activeIdsNone = getActiveQuestions(QUESTIONS_V1, answersNone, baseConsents).map((q) => q.id);
    expect(activeIdsNone).not.toContain('C02');
    expect(activeIdsNone).not.toContain('C03');
    expect(activeIdsNone).not.toContain('C04');
    expect(activeIdsNone).toContain('C05');

    const answersPreferNot = { C01: ['prefer_not'] };
    const activeIdsPreferNot = getActiveQuestions(QUESTIONS_V1, answersPreferNot, baseConsents).map((q) => q.id);
    expect(activeIdsPreferNot).not.toContain('C02');
    expect(activeIdsPreferNot).not.toContain('C03');
    expect(activeIdsPreferNot).not.toContain('C04');
  });

  it('shows C02, C03, C04 when participant reports any symptoms', () => {
    const answers = { C01: ['cramps_pain', 'bloating'] };
    const activeIds = getActiveQuestions(QUESTIONS_V1, answers, baseConsents).map((q) => q.id);
    expect(activeIds).toContain('C02');
    expect(activeIds).toContain('C03');
    expect(activeIds).toContain('C04');
  });

  it('shows C06 only if participant notices changes on C05', () => {
    const answersYes = { C05: 'yes_clearly' };
    expect(getActiveQuestions(QUESTIONS_V1, answersYes, baseConsents).map((q) => q.id)).toContain('C06');

    const answersNo = { C05: 'no' };
    expect(getActiveQuestions(QUESTIONS_V1, answersNo, baseConsents).map((q) => q.id)).not.toContain('C06');
  });
});

describe('Branching Engine — Section D, E, G, H', () => {
  it('shows D05 only if participant felt dismissed on D04', () => {
    expect(getActiveQuestions(QUESTIONS_V1, { D04: 'yes' }, baseConsents).map((q) => q.id)).toContain('D05');
    expect(getActiveQuestions(QUESTIONS_V1, { D04: 'sometimes' }, baseConsents).map((q) => q.id)).toContain('D05');
    expect(getActiveQuestions(QUESTIONS_V1, { D04: 'no' }, baseConsents).map((q) => q.id)).not.toContain('D05');
  });

  it('shows E06 if open/comfortable with companion; shows E07 if hesitant/prefer human', () => {
    const openAnswers = { E05: 'comfortable' };
    const activeOpen = getActiveQuestions(QUESTIONS_V1, openAnswers, baseConsents).map((q) => q.id);
    expect(activeOpen).toContain('E06');
    expect(activeOpen).not.toContain('E07');

    const hesitantAnswers = { E05: 'prefer_human' };
    const activeHesitant = getActiveQuestions(QUESTIONS_V1, hesitantAnswers, baseConsents).map((q) => q.id);
    expect(activeHesitant).not.toContain('E06');
    expect(activeHesitant).toContain('E07');
  });

  it('shows G02, G03 when interested in Founding 100', () => {
    const interested = { G01: 'yes' };
    const activeIds = getActiveQuestions(QUESTIONS_V1, interested, baseConsents).map((q) => q.id);
    expect(activeIds).toContain('G02');
    expect(activeIds).toContain('G03');
    expect(activeIds).toContain('H01');

    const notInterested = { G01: 'not_now' };
    const activeIdsNot = getActiveQuestions(QUESTIONS_V1, notInterested, baseConsents).map((q) => q.id);
    expect(activeIdsNot).not.toContain('G02');
    expect(activeIdsNot).not.toContain('G03');
    // Contact details are skipped if no consent or interest was provided
    expect(activeIdsNot).not.toContain('H01');
  });
});

describe('Branching Engine — Answer Pruning & Inactive Cleanup', () => {
  it('cleans up obsolete answers when user changes upstream branch', () => {
    const previousAnswers: Record<string, any> = {
      A01: '25-29',
      A04: 'unpredictable',
      A05: ['days_vary'],
      B01: 'period_app',
      B02: 'Flo, Clue',
      B03: ['easy_to_use'],
      B04: ['too_many_notifications'],
      B05: 'stopped_using',
      B08: 'Better cycle predictions',
    };

    // User navigates back and changes B01 to 'do_not_track'
    const changedAnswers = {
      ...previousAnswers,
      B01: 'do_not_track',
    };

    const activeQuestions = getActiveQuestions(QUESTIONS_V1, changedAnswers, baseConsents);
    const pruned = pruneInactiveAnswers(changedAnswers, activeQuestions);

    expect(pruned.B01).toBe('do_not_track');
    expect(pruned.B02).toBeUndefined();
    expect(pruned.B03).toBeUndefined();
    expect(pruned.B04).toBeUndefined();
    expect(pruned.B05).toBeUndefined();
    expect(pruned.B08).toBeUndefined();
    expect(pruned.A04).toBe('unpredictable');
    expect(pruned.A05).toEqual(['days_vary']);
  });
});

describe('Branching Engine — Multi-select & Mutually Exclusive Options', () => {
  const options = [
    { id: 'cramps', label: 'Cramps' },
    { id: 'bloating', label: 'Bloating' },
    { id: 'none_of_these', label: 'None of these', isMutuallyExclusive: true },
  ];

  it('selecting mutually exclusive option clears previous selections', () => {
    const current = ['cramps', 'bloating'];
    const updated = handleMultiSelectChange(current, 'none_of_these', options);
    expect(updated).toEqual(['none_of_these']);
  });

  it('selecting a normal option clears existing mutually exclusive option', () => {
    const current = ['none_of_these'];
    const updated = handleMultiSelectChange(current, 'cramps', options);
    expect(updated).toEqual(['cramps']);
  });

  it('respects maxSelectable limit', () => {
    const manyOptions = [
      { id: 'opt1', label: '1' },
      { id: 'opt2', label: '2' },
      { id: 'opt3', label: '3' },
      { id: 'opt4', label: '4' },
    ];
    let selected: string[] = [];
    selected = handleMultiSelectChange(selected, 'opt1', manyOptions, 2);
    selected = handleMultiSelectChange(selected, 'opt2', manyOptions, 2);
    // Attempting to select 3rd item should not exceed limit
    const attempt3 = handleMultiSelectChange(selected, 'opt3', manyOptions, 2);
    expect(attempt3).toEqual(['opt1', 'opt2']);
  });
});

describe('Branching Engine — Validation & Navigation', () => {
  it('validates required fields', () => {
    const requiredQ = QUESTIONS_V1.find((q) => q.id === 'A01')!;
    expect(validateAnswer(requiredQ, '').isValid).toBe(false);
    expect(validateAnswer(requiredQ, '25-29').isValid).toBe(true);
  });

  it('allows skipping optional fields', () => {
    const optionalQ = QUESTIONS_V1.find((q) => q.id === 'A02')!;
    expect(validateAnswer(optionalQ, '').isValid).toBe(true);
    expect(validateAnswer(optionalQ, undefined).isValid).toBe(true);
  });

  it('validates email format on contact fields', () => {
    const emailQ = QUESTIONS_V1.find((q) => q.id === 'H02')!;
    expect(validateAnswer(emailQ, 'invalid-email').isValid).toBe(false);
    expect(validateAnswer(emailQ, 'hello@example.com').isValid).toBe(true);
  });

  it('calculates next and previous question ids correctly', () => {
    const active = getActiveQuestions(QUESTIONS_V1, { A04: 'predictable', B01: 'period_app' }, baseConsents);
    expect(getNextQuestionId('A04', active)).toBe('B01');
    expect(getPreviousQuestionId('B01', active)).toBe('A04');
    expect(getPreviousQuestionId('A01', active)).toBe('A00');
    expect(getPreviousQuestionId('A00', active)).toBe(null);
  });
});

