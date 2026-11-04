import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ConsentState } from '../../types/research';
import { QUESTIONS_V1 } from '../../config/founding100/survey.v1';
import {
  getActiveQuestions,
  pruneInactiveAnswers,
  getNextQuestionId,
  getPreviousQuestionId,
  calculateProgress,
  validateAnswer,
} from '../../lib/research/branching-engine';
import { calculatePoints } from '../../lib/research/scoring';
import {
  buildSubmissionPayload,
  submitResearchResponse,
} from '../../lib/research/submission';
import { ResearchShell } from '../../components/research/ResearchShell';
import { WelcomeScreen } from '../../components/research/WelcomeScreen';
import { ConsentScreen } from '../../components/research/ConsentScreen';
import { IneligibleScreen } from '../../components/research/IneligibleScreen';
import { ExitScreen } from '../../components/research/ExitScreen';
import { QuestionRenderer } from '../../components/research/QuestionRenderer';
import { ReviewScreen } from '../../components/research/ReviewScreen';
import { ThankYouScreen } from '../../components/research/ThankYouScreen';

type FlowStep = 'welcome' | 'consent' | 'ineligible' | 'exit' | 'question' | 'review' | 'thank_you';

export const ResearchExperience: React.FC = () => {
  const [step, setStep] = useState<FlowStep>('welcome');
  const [responseId] = useState<string>(() => {
    return typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `resp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  });
  const [startedAt, setStartedAt] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionId, setCurrentQuestionId] = useState<string>('A00');
  const [validationError, setValidationError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [consents, setConsents] = useState<ConsentState>({
    consent_age: false,
    consent_research: false,
    consent_sensitive_data: false,
    consent_contact: false,
    consent_updates: false,
  });

  const questionRef = useRef<HTMLDivElement>(null);

  // Compute active question list dynamically based on answers & consents
  const activeQuestions = useMemo(() => {
    return getActiveQuestions(QUESTIONS_V1, answers, consents);
  }, [answers, consents]);

  // Current active question
  const currentQuestion = useMemo(() => {
    return activeQuestions.find((q) => q.id === currentQuestionId) || activeQuestions[0];
  }, [activeQuestions, currentQuestionId]);

  // Points score calculation (dynamically from current active valid answers)
  const scoreSummary = useMemo(() => {
    return calculatePoints(activeQuestions, answers);
  }, [activeQuestions, answers]);

  // Adaptive progress
  const progress = useMemo(() => {
    if (step !== 'question' || !currentQuestion) return null;
    return calculateProgress(activeQuestions, currentQuestion.id);
  }, [step, activeQuestions, currentQuestion]);

  // Scroll to top on step or question change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setValidationError(undefined);
  }, [step, currentQuestionId]);

  // Handlers
  const handleStart = () => {
    setStartedAt(new Date().toISOString());
    setStep('consent');
  };

  const handleConsentAccept = (approvedConsents: ConsentState) => {
    setConsents(approvedConsents);
    const initialActive = getActiveQuestions(QUESTIONS_V1, answers, approvedConsents);
    const firstQ = initialActive[0]?.id || 'A00';
    setCurrentQuestionId(firstQ);
    setStep('question');
  };

  const handleConsentIneligible = () => {
    setStep('ineligible');
  };

  const handleConsentDecline = () => {
    setStep('exit');
  };

  const handleAnswerChange = (val: any) => {
    setAnswers((prev) => {
      const updated = { ...prev, [currentQuestion.id]: val };
      // Prune any questions that become inactive
      const active = getActiveQuestions(QUESTIONS_V1, updated, consents);
      return pruneInactiveAnswers(updated, active);
    });
    setValidationError(undefined);
  };

  const handleNext = () => {
    if (!currentQuestion) return;

    const currentVal = answers[currentQuestion.id];
    const validation = validateAnswer(currentQuestion, currentVal);

    if (!validation.isValid) {
      setValidationError(validation.error);
      return;
    }

    setValidationError(undefined);

    // Recompute next question
    const nextId = getNextQuestionId(currentQuestion.id, activeQuestions);
    if (nextId) {
      setCurrentQuestionId(nextId);
    } else {
      // Reached end of questions
      setStep('review');
    }
  };

  const handleBack = () => {
    if (!currentQuestion) return;

    const prevId = getPreviousQuestionId(currentQuestion.id, activeQuestions);
    if (prevId) {
      setCurrentQuestionId(prevId);
    } else {
      // At first question, go back to consent
      setStep('consent');
    }
  };

  const handleSkip = () => {
    if (!currentQuestion) return;

    // Remove skipped question's answer if present
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      const active = getActiveQuestions(QUESTIONS_V1, copy, consents);
      return pruneInactiveAnswers(copy, active);
    });

    setValidationError(undefined);

    const nextId = getNextQuestionId(currentQuestion.id, activeQuestions);
    if (nextId) {
      setCurrentQuestionId(nextId);
    } else {
      setStep('review');
    }
  };

  const handleEditFromReview = (questionId: string) => {
    setCurrentQuestionId(questionId);
    setStep('question');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = buildSubmissionPayload(
        responseId,
        startedAt || new Date().toISOString(),
        answers,
        consents
      );

      const result = await submitResearchResponse(payload);

      if (result.success) {
        setStep('thank_you');
      } else {
        alert('There was a problem submitting your responses. Please try again.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      alert('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setAnswers({});
    setStep('welcome');
    setCurrentQuestionId('A00');
    setConsents({
      consent_age: false,
      consent_research: false,
      consent_sensitive_data: false,
      consent_contact: false,
      consent_updates: false,
    });
  };

  const isLastQuestion = useMemo(() => {
    if (!currentQuestion) return false;
    return getNextQuestionId(currentQuestion.id, activeQuestions) === null;
  }, [currentQuestion, activeQuestions]);

  const hasContactProvided = useMemo(() => {
    return Boolean(answers.A00 || answers.H01 || answers.H02 || answers.H03 || answers.G01 === 'yes');
  }, [answers]);

  return (
    <ResearchShell
      progress={progress}
      showProgress={step === 'question'}
      points={scoreSummary.points}
      showPoints={step === 'question' || step === 'review' || step === 'thank_you'}
    >
      {step === 'welcome' && <WelcomeScreen onStart={handleStart} />}

      {step === 'consent' && (
        <ConsentScreen
          onAccept={handleConsentAccept}
          onIneligible={handleConsentIneligible}
          onDecline={handleConsentDecline}
          onBack={() => setStep('welcome')}
          initialConsents={consents}
        />
      )}

      {step === 'ineligible' && <IneligibleScreen onRestart={handleRestart} />}

      {step === 'exit' && <ExitScreen onRestart={handleRestart} />}

      {step === 'question' && currentQuestion && (
        <div ref={questionRef}>
          <QuestionRenderer
            question={currentQuestion}
            value={answers[currentQuestion.id]}
            onChange={handleAnswerChange}
            onNext={handleNext}
            onBack={handleBack}
            onSkip={handleSkip}
            canGoBack={true}
            error={validationError}
            isLastQuestion={isLastQuestion}
          />
        </div>
      )}

      {step === 'review' && (
        <ReviewScreen
          activeQuestions={activeQuestions}
          answers={answers}
          onEditQuestion={handleEditFromReview}
          onSubmit={handleSubmit}
          onBack={() => setStep('question')}
          isSubmitting={isSubmitting}
          points={scoreSummary.points}
          answeredCount={scoreSummary.answeredCount}
        />
      )}

      {step === 'thank_you' && (
        <ThankYouScreen
          hasContactProvided={hasContactProvided}
          points={scoreSummary.points}
          answeredCount={scoreSummary.answeredCount}
        />
      )}
    </ResearchShell>
  );
};
