import React, { useState, useEffect } from 'react';
import { Question } from '../../types/research';
import { handleMultiSelectChange } from '../../lib/research/branching-engine';
import { Check } from 'lucide-react';

interface MultiSelectQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
}

export const MultiSelectQuestion: React.FC<MultiSelectQuestionProps> = ({
  question,
  value,
  onChange,
}) => {
  // Value can be an array of string IDs, or { selection: string[], otherText?: string }
  const selectedList: string[] = Array.isArray(value)
    ? value
    : typeof value === 'object' && value !== null && Array.isArray(value.selection)
    ? value.selection
    : [];

  const initialOther = typeof value === 'object' && value !== null ? value.otherText || '' : '';
  const [otherText, setOtherText] = useState(initialOther);

  useEffect(() => {
    if (typeof value === 'object' && value !== null && value.otherText !== undefined) {
      setOtherText(value.otherText);
    }
  }, [value]);

  const toggleOption = (optionId: string) => {
    const updated = handleMultiSelectChange(
      selectedList,
      optionId,
      question.options || [],
      question.maxSelectable
    );

    const hasOtherSelected = updated.some(
      (id) => question.options?.find((o) => o.id === id)?.hasOtherInput
    );

    if (hasOtherSelected) {
      onChange({ selection: updated, otherText });
    } else {
      onChange(updated);
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setOtherText(text);
    onChange({ selection: selectedList, otherText: text });
  };

  const hasMax = Boolean(question.maxSelectable);

  return (
    <div className="space-y-2.5 my-4">
      {hasMax && (
        <div className="flex items-center justify-between text-xs font-medium text-forest-muted px-1 mb-1 font-sans">
          <span>Choose up to {question.maxSelectable} options</span>
          <span
            className={`font-mono px-2 py-0.5 rounded-full ${
              selectedList.length === question.maxSelectable
                ? 'bg-peach/20 text-terracotta font-semibold'
                : 'bg-beige text-forest-muted'
            }`}
          >
            {selectedList.length} / {question.maxSelectable} selected
          </span>
        </div>
      )}

      {question.options?.map((option) => {
        const isSelected = selectedList.includes(option.id);
        const isMaxReached =
          hasMax &&
          question.maxSelectable !== undefined &&
          selectedList.length >= question.maxSelectable &&
          !isSelected;

        return (
          <div key={option.id} className="relative">
            <button
              type="button"
              role="checkbox"
              aria-checked={isSelected}
              disabled={isMaxReached}
              onClick={() => toggleOption(option.id)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                isSelected
                  ? 'bg-sage-subtle border-olive text-forest ring-2 ring-olive/50 shadow-sm scale-[1.008]'
                  : isMaxReached
                  ? 'bg-white/50 border-beige text-forest-subtle/50 opacity-60 cursor-not-allowed'
                  : 'bg-white border-beige-dark/50 text-forest/90 hover:border-olive/50 hover:bg-beige-subtle/40 active:scale-[0.99]'
              }`}
            >
              <div className="flex-1 pr-2">
                <span className="font-heading font-medium text-[15px] sm:text-base leading-snug">
                  {option.label}
                </span>
                {option.isMutuallyExclusive && (
                  <span className="block text-[11px] text-forest-muted/70 italic mt-0.5 font-sans">
                    Selecting this clears other choices
                  </span>
                )}
                {option.description && (
                  <p className="text-xs text-forest-muted mt-1 leading-relaxed font-sans">
                    {option.description}
                  </p>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </div>
            </button>

            {/* Conditional "Other" input field */}
            {isSelected && option.hasOtherInput && (
              <div className="mt-2 pl-4 pr-1 animate-fadeIn">
                <label className="block text-xs font-medium text-forest-muted mb-1 font-sans">
                  Please specify:
                </label>
                <input
                  type="text"
                  value={otherText}
                  onChange={handleOtherTextChange}
                  placeholder="Tell us more..."
                  autoFocus
                  className="w-full px-3.5 py-2.5 bg-white border border-olive/50 rounded-lg text-sm text-forest placeholder:text-forest-subtle/50 focus:outline-none focus:ring-2 focus:ring-olive/30 focus:border-olive shadow-inner font-sans"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
