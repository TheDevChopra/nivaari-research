import React from 'react';
import { Question } from '../../types/research';
import { SingleSelectQuestion } from './SingleSelectQuestion';
import { MultiSelectQuestion } from './MultiSelectQuestion';
import { TextQuestion } from './TextQuestion';
import { ScaleQuestion } from './ScaleQuestion';
import { QuestionTransition } from './QuestionTransition';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  canGoBack: boolean;
  error?: string;
  isLastQuestion: boolean;
}

export const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  value,
  onChange,
  onNext,
  onBack,
  onSkip,
  canGoBack,
  error,
  isLastQuestion,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-3 sm:py-6">
      <QuestionTransition questionKey={question.id}>
        {/* Section indicator */}
        <div className="mb-2.5">
          <span className="inline-block text-[11px] uppercase tracking-wider font-heading font-bold text-olive bg-olive-subtle/80 px-2.5 py-1 rounded-full border border-olive/20">
            {question.sectionTitle}
          </span>
        </div>

        {/* Main question prompt with Lexend Bold */}
        <h1 className="text-xl sm:text-2xl md:text-[26px] font-heading font-bold text-forest tracking-tight leading-snug sm:leading-tight">
          {question.prompt}
        </h1>

        {/* Helper text if available */}
        {question.helperText && (
          <p className="text-sm text-forest-muted mt-2 leading-relaxed font-sans">
            {question.helperText}
          </p>
        )}

        {/* Active input based on question type */}
        <div className="mt-4">
          {question.type === 'single_select' && (
            <SingleSelectQuestion
              question={question}
              value={value}
              onChange={onChange}
              onAutoAdvance={onNext}
            />
          )}

          {question.type === 'multi_select' && (
            <MultiSelectQuestion question={question} value={value} onChange={onChange} />
          )}

          {question.type === 'scale' && (
            <ScaleQuestion
              question={question}
              value={value}
              onChange={onChange}
              onAutoAdvance={onNext}
            />
          )}

          {['short_text', 'long_text', 'email', 'phone', 'yes_no'].includes(question.type) && (
            <TextQuestion
              question={question}
              value={value}
              onChange={onChange}
              onEnterSubmit={onNext}
              error={error}
            />
          )}
        </div>

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="mt-3 p-3.5 bg-error-light border border-error-border rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-error font-sans"
          >
            <AlertCircle className="w-4 h-4 shrink-0 text-error" />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation actions bar */}
        <div className="mt-8 pt-4 border-t border-beige flex items-center justify-between gap-3">
          <div>
            {canGoBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-4 py-2.5 rounded-xl text-sm font-heading font-semibold text-forest hover:bg-beige/60 active:bg-beige transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            {!question.required && (
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2.5 rounded-xl text-sm font-heading font-semibold text-forest-muted hover:text-forest hover:bg-beige/40 transition-colors"
              >
                Skip
              </button>
            )}

            <button
              type="button"
              onClick={onNext}
              className="px-6 py-2.5 rounded-xl text-sm font-heading font-semibold bg-olive text-white hover:bg-olive-dark active:scale-[0.98] transition-all shadow-sm flex items-center gap-2"
            >
              <span>{isLastQuestion ? 'Review answers' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </QuestionTransition>
    </div>
  );
};
