import { Question, ConsentState, SectionId } from '../../types/research';

export interface SectionProgress {
  currentStepIndex: number;
  totalActiveSteps: number;
  currentSectionId: SectionId;
  currentSectionTitle: string;
  percent: number;
  completedSections: SectionId[];
}

/**
 * Returns the list of questions currently active based on existing answers and consents.
 */
export function getActiveQuestions(
  allQuestions: Question[],
  answers: Record<string, any>,
  consents: ConsentState
): Question[] {
  return allQuestions.filter((q) => {
    if (!q.condition) return true;
    try {
      return q.condition(answers, consents);
    } catch (e) {
      console.error(`Error evaluating condition for question ${q.id}:`, e);
      return false;
    }
  });
}

/**
 * Prunes answers that are no longer part of the active question path.
 * If a user navigates back and changes a branch-defining answer,
 * answers to bypassed/hidden questions are cleanly removed.
 */
export function pruneInactiveAnswers(
  answers: Record<string, any>,
  activeQuestions: Question[]
): Record<string, any> {
  const activeIds = new Set(activeQuestions.map((q) => q.id));
  const pruned: Record<string, any> = {};

  for (const [key, value] of Object.entries(answers)) {
    if (activeIds.has(key)) {
      pruned[key] = value;
    }
  }

  return pruned;
}

/**
 * Determines the next active question. Returns null if at the end of the survey.
 */
export function getNextQuestionId(
  currentQuestionId: string,
  activeQuestions: Question[]
): string | null {
  const idx = activeQuestions.findIndex((q) => q.id === currentQuestionId);
  if (idx === -1 || idx === activeQuestions.length - 1) {
    return null;
  }
  return activeQuestions[idx + 1].id;
}

/**
 * Determines the previous active question. Returns null if at the first question.
 */
export function getPreviousQuestionId(
  currentQuestionId: string,
  activeQuestions: Question[]
): string | null {
  const idx = activeQuestions.findIndex((q) => q.id === currentQuestionId);
  if (idx <= 0) {
    return null;
  }
  return activeQuestions[idx - 1].id;
}

/**
 * Calculates adaptive progress across active questions and sections.
 */
export function calculateProgress(
  activeQuestions: Question[],
  currentQuestionId: string
): SectionProgress {
  const currentIndex = activeQuestions.findIndex((q) => q.id === currentQuestionId);
  const safeIndex = currentIndex === -1 ? 0 : currentIndex;
  const total = activeQuestions.length;
  const currentQ = activeQuestions[safeIndex] || activeQuestions[0];

  const currentSectionId = currentQ ? currentQ.sectionId : 'A';
  const currentSectionTitle = currentQ ? currentQ.sectionTitle : 'About you';

  // Find all distinct sections present in active questions
  const sectionOrder: SectionId[] = [];
  activeQuestions.forEach((q) => {
    if (!sectionOrder.includes(q.sectionId)) {
      sectionOrder.push(q.sectionId);
    }
  });

  const currentSectionIndex = sectionOrder.indexOf(currentSectionId);
  const completedSections = sectionOrder.slice(0, Math.max(0, currentSectionIndex));

  // Adaptive percentage calculation
  const percent = total > 0 ? Math.round(((safeIndex + 1) / total) * 100) : 0;

  return {
    currentStepIndex: safeIndex + 1,
    totalActiveSteps: total,
    currentSectionId,
    currentSectionTitle,
    percent,
    completedSections,
  };
}

/**
 * Handles mutual exclusivity logic for multi-select options.
 * If a mutually exclusive option (e.g. "none_of_these") is chosen, it clears others.
 * If regular options are chosen, it unselects the mutually exclusive ones.
 */
export function handleMultiSelectChange(
  currentSelection: string[],
  toggledOptionId: string,
  options: { id: string; isMutuallyExclusive?: boolean }[],
  maxSelectable?: number
): string[] {
  const optionMeta = options.find((o) => o.id === toggledOptionId);
  const isExclusive = !!optionMeta?.isMutuallyExclusive;

  if (isExclusive) {
    // If selecting an exclusive option, it becomes the only selection
    if (currentSelection.includes(toggledOptionId)) {
      return [];
    }
    return [toggledOptionId];
  }

  // Regular option toggled: first strip any existing exclusive options
  const exclusiveIds = new Set(options.filter((o) => o.isMutuallyExclusive).map((o) => o.id));
  const base = currentSelection.filter((id) => !exclusiveIds.has(id));

  if (base.includes(toggledOptionId)) {
    return base.filter((id) => id !== toggledOptionId);
  } else {
    if (maxSelectable && base.length >= maxSelectable) {
      // Cannot select more than maximum
      return base;
    }
    return [...base, toggledOptionId];
  }
}

/**
 * Validates an answer for a question.
 */
export function validateAnswer(question: Question, value: any): { isValid: boolean; error?: string } {
  // If not required and empty, it is valid
  const isEmpty =
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'object' && !Array.isArray(value) && (!value.selection || value.selection.length === 0));

  if (!question.required && isEmpty) {
    return { isValid: true };
  }

  if (question.required && isEmpty) {
    return { isValid: false, error: 'Please choose or provide an answer before continuing.' };
  }

  if (question.type === 'email' && typeof value === 'string' && value.trim()) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value.trim())) {
      return { isValid: false, error: 'Please enter a valid email address.' };
    }
  }

  if (question.type === 'multi_select' && question.maxSelectable) {
    const list = Array.isArray(value) ? value : value?.selection || [];
    if (list.length > question.maxSelectable) {
      return {
        isValid: false,
        error: `Please select up to ${question.maxSelectable} options.`,
      };
    }
  }

  return { isValid: true };
}

