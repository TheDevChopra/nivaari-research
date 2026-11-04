import React from 'react';
import { Question } from '../../types/research';
import { COPY } from '../../config/founding100/copy.v1';
import { ArrowLeft, CheckCircle2, ShieldCheck, Edit3, Loader2, Sparkles } from 'lucide-react';

interface ReviewScreenProps {
  activeQuestions: Question[];
  answers: Record<string, any>;
  onEditQuestion: (questionId: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
  points?: number;
  answeredCount?: number;
}

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  activeQuestions,
  answers,
  onEditQuestion,
  onSubmit,
  onBack,
  isSubmitting,
  points = 0,
  answeredCount = 0,
}) => {
  // Group active questions by section
  const sectionGroups: { sectionTitle: string; questions: Question[] }[] = [];

  activeQuestions.forEach((q) => {
    let group = sectionGroups.find((g) => g.sectionTitle === q.sectionTitle);
    if (!group) {
      group = { sectionTitle: q.sectionTitle, questions: [] };
      sectionGroups.push(group);
    }
    group.questions.push(q);
  });

  const formatAnswerDisplay = (question: Question, val: any): string => {
    if (val === undefined || val === null || val === '') {
      return 'Skipped / Not answered';
    }

    if (question.type === 'scale') {
      return `${val} / 5`;
    }

    if (question.type === 'single_select') {
      const optId = typeof val === 'object' ? val.selection : val;
      const opt = question.options?.find((o) => o.id === optId);
      let text = opt ? opt.label : optId;
      if (typeof val === 'object' && val.otherText) {
        text += ` ("${val.otherText}")`;
      }
      return text;
    }

    if (question.type === 'multi_select') {
      const list = Array.isArray(val) ? val : val?.selection || [];
      if (list.length === 0) return 'Skipped / Not answered';
      const labels = list.map((id: string) => {
        const opt = question.options?.find((o) => o.id === id);
        return opt ? opt.label : id;
      });
      let res = labels.join(', ');
      if (typeof val === 'object' && val.otherText) {
        res += ` [Other: ${val.otherText}]`;
      }
      return res;
    }

    if (question.type === 'yes_no') {
      return val === 'yes' ? 'Yes' : 'No';
    }

    return String(val);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn font-sans">
      {/* Header */}
      <div className="mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold tracking-wide bg-sage-subtle text-olive border border-sage/40">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Final Review
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-forest leading-tight mb-2">
        {COPY.review.title}
      </h1>
      <p className="text-forest/80 text-sm leading-relaxed mb-6 font-normal">
        {COPY.review.subtitle}
      </p>

      {/* Points Summary Card */}
      <div className="p-4 sm:p-5 mb-6 bg-beige-light border border-beige-dark/70 rounded-2xl shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sage-subtle text-olive flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-peach-dark" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-sm sm:text-base text-forest">
                {COPY.points.summaryTitle}
              </h2>
              <span className="text-xs text-forest-muted">
                {answeredCount} research questions answered
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-heading font-bold text-xl sm:text-2xl text-olive">
              {points}
            </span>
            <span className="text-xs font-heading font-bold text-forest-muted block">
              POINTS
            </span>
          </div>
        </div>
        <p className="text-xs text-forest/80 leading-relaxed pt-2 border-t border-beige-dark/40">
          {COPY.points.summaryAppreciation}
        </p>
        <p className="text-[10px] text-forest-subtle italic mt-1">
          {COPY.points.disclaimer}
        </p>
      </div>

      {/* Privacy guarantee banner */}
      <div className="p-3.5 mb-6 bg-white border border-sage/50 rounded-xl flex items-start gap-3 shadow-subtle text-xs sm:text-sm text-forest">
        <ShieldCheck className="w-5 h-5 text-olive shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold text-olive">Privacy Notice:</strong> Your name and contact details are separated from your research health answers and stored in an isolated table with Row Level Security.
        </p>
      </div>

      {/* Grouped question answers */}
      <div className="space-y-6 mb-8">
        {sectionGroups.map((group) => (
          <div key={group.sectionTitle} className="bg-white border border-beige-dark/50 rounded-2xl p-4 sm:p-5 shadow-subtle">
            <h2 className="text-xs uppercase tracking-wider font-heading font-bold text-olive mb-3 pb-2 border-b border-beige">
              {group.sectionTitle}
            </h2>

            <div className="space-y-4">
              {group.questions.map((q) => {
                const answerVal = answers[q.id];
                const display = formatAnswerDisplay(q, answerVal);
                const isSkipped = display === 'Skipped / Not answered';

                return (
                  <div key={q.id} className="flex items-start justify-between gap-3 text-sm">
                    <div className="flex-1 pr-2">
                      <p className="font-heading font-medium text-forest text-[13px] sm:text-sm leading-snug">
                        {q.prompt}
                      </p>
                      <p className={`mt-1 text-xs leading-relaxed font-sans ${isSkipped ? 'text-forest-subtle italic' : 'text-forest/85'}`}>
                        {display}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onEditQuestion(q.id)}
                      className="p-1.5 text-forest-muted hover:text-olive hover:bg-sage-subtle/50 rounded-lg transition-colors shrink-0"
                      title="Edit response"
                      aria-label={`Edit ${q.prompt}`}
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3.5 bg-olive text-white font-heading font-semibold text-sm sm:text-base rounded-xl hover:bg-olive-dark active:scale-[0.98] transition-all shadow-card flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{COPY.review.submitting}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{COPY.review.submitCta}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-4 py-3 rounded-xl text-xs sm:text-sm font-heading font-semibold text-forest-muted hover:text-forest hover:bg-beige/40 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to survey</span>
        </button>
      </div>
    </div>
  );
};
