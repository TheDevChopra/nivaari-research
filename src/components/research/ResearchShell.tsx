import React from 'react';
import { SectionProgress } from '../../lib/research/branching-engine';
import { ProgressIndicator } from './ProgressIndicator';
import { PointsCounter } from './PointsCounter';
import { Shield } from 'lucide-react';

interface ResearchShellProps {
  children: React.ReactNode;
  progress?: SectionProgress | null;
  showProgress?: boolean;
  points?: number;
  showPoints?: boolean;
}

export const ResearchShell: React.FC<ResearchShellProps> = ({
  children,
  progress,
  showProgress = false,
  points = 0,
  showPoints = false,
}) => {
  return (
    <div className="min-h-screen bg-ivory text-forest flex flex-col justify-between selection:bg-sage/40 selection:text-forest font-sans">
      {/* Top Header */}
      <header className="w-full border-b border-beige/80 bg-white/75 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          {/* Nivaari Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/nivaari-logo.png"
              alt="Nivaari Logo"
              className="h-7 sm:h-8 w-auto object-contain"
            />
          </div>

          {/* Right Header items: Points Counter & Founding 100 Pill */}
          <div className="flex items-center gap-2">
            {showPoints && <PointsCounter points={points} />}

            <div className="hidden xs:flex items-center gap-1.5 text-xs text-forest-muted font-medium bg-beige-subtle px-2.5 py-1 rounded-full border border-beige-dark/40 font-heading">
              <span className="w-1.5 h-1.5 rounded-full bg-olive" />
              <span>Founding 100</span>
            </div>
          </div>
        </div>

        {/* Adaptive Progress Bar (visible during active questions) */}
        {showProgress && progress && (
          <div className="max-w-2xl mx-auto border-t border-beige/40">
            <ProgressIndicator progress={progress} points={points} />
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-center py-4 sm:py-8" role="main">
        {children}
      </main>

      {/* Accessible, reassuring footer */}
      <footer className="w-full border-t border-beige/60 py-4 px-4 bg-ivory-darker/30 text-center text-[11px] sm:text-xs text-forest-muted space-y-1 font-sans">
        <div className="flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-olive shrink-0" />
          <span>Research Study · Responses separated from contact details · RLS protected</span>
        </div>
        <p className="text-[10px] text-forest-subtle">
          This research form is voluntary and not intended for medical diagnosis, treatment, or emergency advice.
        </p>
      </footer>
    </div>
  );
};
