import { Question } from '../../types/research';

export const CONTACT_QUESTION_IDS = new Set(['A00', 'H01', 'H02', 'H03', 'H04', 'H05']);
export const POINTS_PER_QUESTION = 5;

/**
 * Determines whether a question ID is a research health question eligible for points.
 * Contact, identification, consent, and eligibility questions are excluded.
 */
export function isResearchQuestion(questionId: string): boolean {
  return !CONTACT_QUESTION_IDS.has(questionId);
}

/**
 * Determines whether an answer has been validly provided.
 */
export function isAnswerProvided(value: any): boolean {
  if (value === undefined || value === null) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (typeof value === 'number') {
    return !isNaN(value);
  }

  if (typeof value === 'boolean') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === 'object') {
    if (Array.isArray(value.selection)) {
      return value.selection.length > 0;
    }
    if (typeof value.selection === 'string') {
      return value.selection.trim().length > 0;
    }
    if (typeof value.otherText === 'string') {
      return value.otherText.trim().length > 0;
    }
  }

  return false;
}

export interface ScoreSummary {
  points: number;
  answeredCount: number;
  totalEligibleCount: number;
  answeredQuestionIds: string[];
}

/**
 * Calculates current score dynamically from active questions and valid answers.
 * - Every answered research question awards exactly 5 points.
 * - Changing an answer keeps points at 5 (no double counting).
 * - Going back does not duplicate points.
 * - Branch changes that remove questions automatically drop their points.
 * - Skipped questions and contact/identity fields receive 0 points.
 */
export function calculatePoints(
  activeQuestions: Question[],
  answers: Record<string, any>
): ScoreSummary {
  const eligibleQuestions = activeQuestions.filter((q) => isResearchQuestion(q.id));
  const answeredQuestionIds: string[] = [];

  for (const q of eligibleQuestions) {
    const val = answers[q.id];
    if (isAnswerProvided(val)) {
      answeredQuestionIds.push(q.id);
    }
  }

  return {
    points: answeredQuestionIds.length * POINTS_PER_QUESTION,
    answeredCount: answeredQuestionIds.length,
    totalEligibleCount: eligibleQuestions.length,
    answeredQuestionIds,
  };
}

