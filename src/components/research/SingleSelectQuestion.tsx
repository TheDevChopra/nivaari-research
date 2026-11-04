import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../types/research';
import { Check } from 'lucide-react';

interface SingleSelectQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onAutoAdvance?: () => void;
}

export const SingleSelectQuestion: React.FC<SingleSelectQuestionProps> = ({
  question,
  value,
  onChange,
  onAutoAdvance,
}) => {
  // Value can be a plain string (option id) or object { selection: string, otherText?: string }
  const selectedId = typeof value === 'object' && value !== null ? value.selection : value || '';
  const initialOther = typeof value === 'object' && value !== null ? value.otherText || '' : '';
  const [otherText, setOtherText] = useState(initialOther);
  const [pendingAdvanceId, setPendingAdvanceId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof value === 'object' && value !== null && value.otherText !== undefined) {
      setOtherText(value.otherText);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (optionId: string, hasOtherInput?: boolean) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (hasOtherInput) {
      setPendingAdvanceId(null);
      onChange({ selection: optionId, otherText });
      return;
    }

    // Standard option: update answer & auto-advance with ~380ms subtle delay
    onChange(optionId);
    setPendingAdvanceId(optionId);

    if (onAutoAdvance) {
      timeoutRef.current = setTimeout(() => {
        onAutoAdvance();
        setPendingAdvanceId(null);
      }, 380);
    }
  };

  const handleOtherTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setOtherText(text);
    onChange({ selection: selectedId, otherText: text });
  };

  const handleOtherKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onAutoAdvance) {
        onAutoAdvance();
      }
    }
  };

  return (
    <div className="space-y-2.5 my-4" role="radiogroup" aria-label={question.prompt}>
      {question.options?.map((option) => {
        const isSelected = selectedId === option.id;
        const isAdvancing = pendingAdvanceId === option.id;

        return (
          <div key={option.id} className="relative">
            <button
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => handleSelect(option.id, option.hasOtherInput)}
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                isSelected || isAdvancing
                  ? 'bg-sage-subtle border-olive text-forest ring-2 ring-olive/50 shadow-sm scale-[1.008]'
                  : 'bg-white border-beige-dark/50 text-forest/90 hover:border-olive/50 hover:bg-beige-subtle/40 active:scale-[0.99]'
              }`}
            >
              <div className="flex-1 pr-2">
                <span className="font-heading font-medium text-[15px] sm:text-base leading-snug">
                  {option.label}
                </span>
                {option.description && (
                  <p className="text-xs text-forest-muted mt-1 leading-relaxed">
                    {option.description}
                  </p>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  isSelected || isAdvancing ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
                }`}
              >
                {(isSelected || isAdvancing) && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
              </div>
            </button>

            {/* Conditional "Other" input field */}
            {isSelected && option.hasOtherInput && (
              <div className="mt-2 pl-4 pr-1 animate-fadeIn">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-forest-muted">
                    Please specify:
                  </label>
                  <span className="text-[10px] text-forest-subtle font-mono">
                    Press Enter ↵ to continue
                  </span>
                </div>
                <input
                  type="text"
                  value={otherText}
                  onChange={handleOtherTextChange}
                  onKeyDown={handleOtherKeyDown}
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
