import React from 'react';
import { COPY } from '../../config/founding100/copy.v1';
import { Sparkles, ShieldCheck, HeartHandshake, CheckCircle2 } from 'lucide-react';

interface ThankYouScreenProps {
  hasContactProvided?: boolean;
  points?: number;
  answeredCount?: number;
}

export const ThankYouScreen: React.FC<ThankYouScreenProps> = ({
  hasContactProvided,
  points = 0,
  answeredCount = 0,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8 sm:py-14 text-center animate-fadeIn font-sans">
      {/* Icon */}
      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-sage-subtle border border-sage/50 text-olive flex items-center justify-center shadow-subtle">
        <Sparkles className="w-8 h-8 stroke-[2]" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold tracking-wide bg-sage-subtle text-olive border border-sage/40 mb-3">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Submission Complete
      </div>

      <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-forest mb-3 leading-tight">
        {COPY.thankYou.headline}
      </h1>

      <p className="text-forest/85 text-base sm:text-lg leading-relaxed max-w-md mx-auto mb-6 font-medium">
        {COPY.thankYou.subheadline}
      </p>

      {/* Points summary card */}
      <div className="bg-beige-light border border-beige-dark/60 rounded-2xl p-5 mb-6 text-left shadow-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sage-subtle text-olive flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-peach-dark" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-base text-forest">
                {COPY.points.summaryTitle}
              </h2>
              <span className="text-xs text-forest-muted">
                {answeredCount} research questions answered
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-heading font-bold text-2xl text-olive">
              {points}
            </span>
            <span className="text-[11px] font-heading font-bold text-forest-muted block">
              POINTS
            </span>
          </div>
        </div>
        <p className="text-xs text-forest/85 leading-relaxed pt-2 border-t border-beige-dark/40">
          {COPY.points.summaryAppreciation}
        </p>
        <p className="text-[10px] text-forest-subtle italic mt-1">
          {COPY.points.disclaimer}
        </p>
      </div>

      {/* Founding 100 Note Card */}
      {hasContactProvided && (
        <div className="bg-white border border-beige-dark/50 rounded-2xl p-5 mb-6 text-left shadow-subtle">
          <div className="flex items-center gap-2 mb-2">
            <HeartHandshake className="w-4 h-4 text-olive" />
            <h2 className="text-xs uppercase tracking-wider font-heading font-bold text-olive">
              Founding 100 Next Steps
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-forest/85 leading-relaxed">
            {COPY.thankYou.foundingNote}
          </p>
        </div>
      )}

      {/* Privacy reassurance */}
      <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-beige-subtle/80 border border-beige-dark/40 text-xs text-forest-muted">
        <ShieldCheck className="w-4 h-4 text-olive shrink-0" />
        <span>{COPY.thankYou.privacyNote}</span>
      </div>
    </div>
  );
};
