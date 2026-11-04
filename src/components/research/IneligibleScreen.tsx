import React from 'react';
import { COPY } from '../../config/founding100/copy.v1';
import { Heart, RotateCcw } from 'lucide-react';

interface IneligibleScreenProps {
  onRestart: () => void;
}

export const IneligibleScreen: React.FC<IneligibleScreenProps> = ({ onRestart }) => {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-10 sm:py-16 text-center animate-fadeIn font-sans">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-peach-subtle text-terracotta flex items-center justify-center">
        <Heart className="w-7 h-7" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-forest mb-3">
        {COPY.ineligible.title}
      </h1>

      <p className="text-forest/80 text-sm sm:text-base leading-relaxed mb-4 max-w-md mx-auto">
        {COPY.ineligible.message}
      </p>

      <p className="text-forest-muted text-xs sm:text-sm mb-8">
        {COPY.ineligible.subtext}
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-olive text-white text-sm font-heading font-semibold hover:bg-olive-dark active:scale-[0.98] transition-all shadow-sm"
      >
        <RotateCcw className="w-4 h-4" />
        <span>{COPY.ineligible.homeCta}</span>
      </button>
    </div>
  );
};
