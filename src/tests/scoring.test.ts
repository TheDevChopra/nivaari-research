import { describe, it, expect } from 'vitest';
import { calculatePoints, isResearchQuestion } from '../lib/research/scoring';
import { QUESTIONS_V1 } from '../config/founding100/survey.v1';
import { getActiveQuestions } from '../lib/research/branching-engine';
import { ConsentState } from '../types/research';

const baseConsents: ConsentState = {
  consent_age: true,
  consent_research: true,
  consent_sensitive_data: true,
  consent_contact: true,
  consent_updates: false,
};

describe('Points System & Central Scoring Rules', () => {
  it('excludes contact fields (A00, H01..H05) from research scoring', () => {
    expect(isResearchQuestion('A00')).toBe(false);
    expect(isResearchQuestion('H01')).toBe(false);
    expect(isResearchQuestion('H02')).toBe(false);
    expect(isResearchQuestion('H03')).toBe(false);
    expect(isResearchQuestion('A01')).toBe(true);
    expect(isResearchQuestion('B01')).toBe(true);
    expect(isResearchQuestion('C01')).toBe(true);
  });

  it('awards 5 points per answered research question', () => {
    const answers = {
      A01: '25-29',
      A04: 'predictable',
    };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const score = calculatePoints(active, answers);

    expect(score.answeredCount).toBe(2);
    expect(score.points).toBe(10);
  });

  it('awards only 5 points for multi-select questions with multiple selections', () => {
    const answers = {
      C01: ['cramps_pain', 'bloating', 'headaches', 'fatigue'], // 4 selections in 1 question
    };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const score = calculatePoints(active, answers);

    expect(score.answeredCount).toBe(1);
    expect(score.points).toBe(5);
  });

  it('awards 0 points for contact and full name fields', () => {
    const answers = {
      A00: 'Maya Rao', // Full name
      H01: 'Maya Rao',
      H02: 'maya@example.com',
      H03: '+91 98765 43210',
    };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const score = calculatePoints(active, answers);

    expect(score.answeredCount).toBe(0);
    expect(score.points).toBe(0);
  });

  it('awards 0 points for skipped optional questions', () => {
    const answers = {
      A01: '25-29',
      A02: '', // Skipped
      A03: undefined, // Skipped
      A04: 'predictable',
    };
    const active = getActiveQuestions(QUESTIONS_V1, answers, baseConsents);
    const score = calculatePoints(active, answers);

    expect(score.answeredCount).toBe(2); // Only A01 and A04
    expect(score.points).toBe(10);
  });

  it('does not duplicate points when an answer is updated or revisited', () => {
    const answersStep1 = { A01: '21-24' };
    const score1 = calculatePoints(getActiveQuestions(QUESTIONS_V1, answersStep1, baseConsents), answersStep1);
    expect(score1.points).toBe(5);

    // Revisiting and changing to '25-29'
    const answersStep2 = { A01: '25-29' };
    const score2 = calculatePoints(getActiveQuestions(QUESTIONS_V1, answersStep2, baseConsents), answersStep2);
    expect(score2.points).toBe(5);
  });

  it('removes points from questions that become inactive when branching changes', () => {
    // Initial: user tracks with period app, answers B02 and B03
    const answersTracker = {
      A01: '25-29',
      A04: 'predictable',
      B01: 'period_app',
      B02: 'Flo',
      B03: ['easy_to_use'],
    };
    const activeTracker = getActiveQuestions(QUESTIONS_V1, answersTracker, baseConsents);
    const scoreTracker = calculatePoints(activeTracker, answersTracker);
    expect(scoreTracker.answeredCount).toBe(5);
    expect(scoreTracker.points).toBe(25);

    // User navigates back and changes B01 to 'do_not_track'
    // B02 and B03 are no longer active questions!
    const answersNonTracker = {
      ...answersTracker,
      B01: 'do_not_track',
    };
    const activeNonTracker = getActiveQuestions(QUESTIONS_V1, answersNonTracker, baseConsents);
    const scoreNonTracker = calculatePoints(activeNonTracker, answersNonTracker);

    // Only A01, A04, B01 are active and answered
    expect(scoreNonTracker.answeredCount).toBe(3);
    expect(scoreNonTracker.points).toBe(15);
  });
});

