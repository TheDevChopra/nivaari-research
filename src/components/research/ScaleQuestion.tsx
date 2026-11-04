import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../../types/research';

interface ScaleQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onAutoAdvance?: () => void;
}

export const ScaleQuestion: React.FC<ScaleQuestionProps> = ({
  question,
  value,
  onChange,
  onAutoAdvance,
}) => {
  const config = question.scaleConfig || {
    min: 1,
    max: 5,
    minLabel: 'Not at all',
    maxLabel: 'A great deal',
  };

  const scaleValues = Array.from(
    { length: config.max - config.min + 1 },
    (_, i) => config.min + i
  );

  const selectedVal = typeof value === 'number' ? value : value ? parseInt(value, 10) : null;
  const [pendingVal, setPendingVal] = useState<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSelect = (score: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    onChange(score);
    setPendingVal(score);

    if (onAutoAdvance) {
      timeoutRef.current = setTimeout(() => {
        onAutoAdvance();
        setPendingVal(null);
      }, 380);
    }
  };

  return (
    <div className="my-6">
      <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-3">
        {scaleValues.map((score) => {
          const isSelected = selectedVal === score || pendingVal === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => handleSelect(score)}
              className={`h-14 sm:h-16 rounded-xl border flex flex-col items-center justify-center font-heading font-bold text-lg sm:text-xl transition-all active:scale-95 ${
                isSelected
                  ? 'bg-olive text-white border-olive shadow-md ring-2 ring-olive/50 scale-[1.03]'
                  : 'bg-white text-forest border-beige-dark/50 hover:border-olive/50 hover:bg-beige-subtle/50'
              }`}
              aria-label={`Rating ${score} out of ${config.max}`}
            >
              <span>{score}</span>
            </button>
          );
        })}
      </div>

      <div className="flex justify-between items-center text-xs sm:text-sm text-forest-muted px-1 font-sans">
        <span className="max-w-[45%] text-left font-medium text-forest-muted">
          1 — {config.minLabel}
        </span>
        <span className="max-w-[45%] text-right font-medium text-forest-muted">
          5 — {config.maxLabel}
        </span>
      </div>
    </div>
  );
};
