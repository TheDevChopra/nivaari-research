import React from 'react';
import { COPY } from '../../config/founding100/copy.v1';
import { ArrowRight, Clock, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-10 animate-fadeIn font-sans">
      {/* Brand Badge */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold tracking-wide bg-sage-subtle text-olive border border-sage/40">
          <Sparkles className="w-3.5 h-3.5" />
          {COPY.brand.programName}
        </span>
      </div>

      {/* Hero Headline with Lexend Bold */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-heading font-bold text-forest leading-tight tracking-tight mb-4">
        {COPY.welcome.headline}
      </h1>

      {/* Copy paragraphs */}
      <div className="space-y-3.5 text-forest/85 text-[15px] sm:text-base leading-relaxed">
        <p className="font-normal">{COPY.welcome.paragraph1}</p>
        <p className="font-medium text-forest">{COPY.welcome.paragraph2}</p>
        <div className="p-4 bg-beige-subtle/80 border border-beige-dark/50 rounded-2xl text-sm leading-relaxed text-forest">
          <p>{COPY.welcome.paragraph3}</p>
        </div>
      </div>

      {/* Values & Integrity highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-6">
        <div className="flex items-center sm:flex-col sm:items-start gap-2.5 p-3 rounded-xl bg-white border border-beige-dark/30 shadow-subtle">
          <div className="w-7 h-7 rounded-lg bg-sage-subtle text-olive flex items-center justify-center shrink-0">
            <HeartHandshake className="w-4 h-4" />
          </div>
          <span className="text-xs font-heading font-medium text-forest">Women-led & Empathetic</span>
        </div>
        <div className="flex items-center sm:flex-col sm:items-start gap-2.5 p-3 rounded-xl bg-white border border-beige-dark/30 shadow-subtle">
          <div className="w-7 h-7 rounded-lg bg-sage-subtle text-olive flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-heading font-medium text-forest">Separated & Confidential Data</span>
        </div>
        <div className="flex items-center sm:flex-col sm:items-start gap-2.5 p-3 rounded-xl bg-white border border-beige-dark/30 shadow-subtle">
          <div className="w-7 h-7 rounded-lg bg-peach-subtle text-terracotta flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="text-xs font-heading font-medium text-forest">No AI Ads or Medical Triage</span>
        </div>
      </div>

      {/* Primary CTA button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onStart}
          className="w-full sm:w-auto min-w-[240px] px-8 py-4 bg-olive text-white font-heading font-semibold text-base rounded-2xl hover:bg-olive-dark active:scale-[0.98] transition-all shadow-card flex items-center justify-center gap-3 group"
        >
          <span>{COPY.welcome.cta}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </button>

        {/* Time estimate helper */}
        <div className="flex items-center gap-2 text-xs text-forest-muted mt-3.5 px-1 font-sans">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>{COPY.welcome.estimatedTime}</span>
        </div>
      </div>
    </div>
  );
};
