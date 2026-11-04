import React from 'react';
import { SectionProgress } from '../../lib/research/branching-engine';
import { Sparkles } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: SectionProgress;
  points?: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress, points = 0 }) => {
  return (
    <div className="w-full px-4 pt-3 pb-2.5 font-sans" aria-label="Survey Progress">
      <div className="flex items-center justify-between text-xs tracking-wide font-medium text-forest-muted mb-1.5">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-olive animate-pulse" />
          <span className="font-heading font-bold text-forest text-xs sm:text-[13px]">
            {progress.currentSectionTitle}
          </span>
        </span>

        <div className="flex items-center gap-2.5">
          {points > 0 && (
            <span className="inline-flex items-center gap-1 font-heading font-bold text-xs text-olive bg-sage-subtle px-2 py-0.5 rounded-full border border-sage/40">
              <Sparkles className="w-3 h-3 text-peach-dark" />
              <span>{points} pts</span>
            </span>
          )}
          <span className="text-forest-muted font-mono text-[11px] sm:text-xs">
            Step {progress.currentStepIndex} of {progress.totalActiveSteps}
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-1.5 bg-beige rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-olive to-sage transition-all duration-500 ease-out rounded-full"
          style={{ width: `${Math.max(4, progress.percent)}%` }}
          role="progressbar"
          aria-valuenow={progress.percent}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
