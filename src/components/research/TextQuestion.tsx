import React, { useRef, useEffect } from 'react';
import { Question } from '../../types/research';
import { CornerDownLeft } from 'lucide-react';

interface TextQuestionProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  onEnterSubmit?: () => void;
  error?: string;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  question,
  value,
  onChange,
  onEnterSubmit,
  error,
}) => {
  const strVal = typeof value === 'string' ? value : '';
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleYesNoSelect = (optId: string) => {
    onChange(optId);
    if (onEnterSubmit) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        onEnterSubmit();
      }, 380);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    isMultiline: boolean
  ) => {
    if (isMultiline) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (onEnterSubmit) {
          onEnterSubmit();
        }
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (onEnterSubmit) {
          onEnterSubmit();
        }
      }
    }
  };

  if (question.type === 'yes_no') {
    return (
      <div className="grid grid-cols-2 gap-3 my-4">
        {[
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ].map((opt) => {
          const isSelected = strVal === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleYesNoSelect(opt.id)}
              className={`p-4 rounded-xl border text-center font-heading font-semibold transition-all ${
                isSelected
                  ? 'bg-sage-subtle border-olive text-forest ring-2 ring-olive/50 shadow-sm scale-[1.01]'
                  : 'bg-white border-beige-dark/50 text-forest/90 hover:border-olive/50 hover:bg-beige-subtle/40'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === 'long_text') {
    return (
      <div className="my-4">
        <textarea
          rows={5}
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, true)}
          placeholder={question.placeholder || 'Type your thoughts here...'}
          autoFocus
          className={`w-full p-4 bg-white border rounded-xl text-base text-forest placeholder:text-forest-subtle/50 transition-colors focus:outline-none focus:ring-2 resize-none shadow-sm font-sans ${
            error
              ? 'border-error ring-1 ring-error focus:ring-error/30'
              : 'border-beige-dark/60 focus:border-olive focus:ring-olive/30'
          }`}
          aria-label={question.prompt}
        />
        <div className="flex justify-between items-center text-xs text-forest-muted mt-2 px-1">
          <span className="inline-flex items-center gap-1 text-[11px] text-forest-subtle font-mono">
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 bg-beige-light border border-beige-dark/60 rounded text-[10px] font-semibold text-forest">
              Ctrl
            </kbd>
            <span>+</span>
            <kbd className="px-1.5 py-0.5 bg-beige-light border border-beige-dark/60 rounded text-[10px] font-semibold text-forest flex items-center gap-0.5">
              Enter <CornerDownLeft className="w-2.5 h-2.5" />
            </kbd>
            <span>to continue</span>
          </span>
          <span className="font-mono text-[11px]">{strVal.length} chars</span>
        </div>
      </div>
    );
  }

  const inputType = question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text';

  return (
    <div className="my-4">
      <input
        type={inputType}
        value={strVal}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e, false)}
        placeholder={question.placeholder || 'Your answer...'}
        autoFocus
        className={`w-full px-4 py-4 bg-white border rounded-xl text-base text-forest placeholder:text-forest-subtle/50 transition-colors focus:outline-none focus:ring-2 shadow-sm font-sans ${
          error
            ? 'border-error ring-1 ring-error focus:ring-error/30'
            : 'border-beige-dark/60 focus:border-olive focus:ring-olive/30'
        }`}
        aria-label={question.prompt}
      />
      <div className="flex items-center gap-1 text-[11px] text-forest-subtle font-mono mt-2 px-1">
        <span>Press</span>
        <kbd className="px-1.5 py-0.5 bg-beige-light border border-beige-dark/60 rounded text-[10px] font-semibold text-forest flex items-center gap-0.5">
          Enter <CornerDownLeft className="w-2.5 h-2.5" />
        </kbd>
        <span>to continue</span>
      </div>
    </div>
  );
};
