import React, { useState } from 'react';
import { ConsentState } from '../../types/research';
import { COPY } from '../../config/founding100/copy.v1';
import { Shield, ArrowRight, AlertCircle, ArrowLeft, Check } from 'lucide-react';

interface ConsentScreenProps {
  onAccept: (consents: ConsentState) => void;
  onIneligible: () => void;
  onDecline: () => void;
  onBack: () => void;
  initialConsents?: ConsentState;
}

export const ConsentScreen: React.FC<ConsentScreenProps> = ({
  onAccept,
  onIneligible,
  onDecline,
  onBack,
  initialConsents,
}) => {
  const [consents, setConsents] = useState<ConsentState>(
    initialConsents || {
      consent_age: false,
      consent_research: false,
      consent_sensitive_data: false,
      consent_contact: false,
      consent_updates: false,
    }
  );

  const [validationError, setValidationError] = useState<string | null>(null);

  const toggleConsent = (key: keyof ConsentState) => {
    setConsents((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setValidationError(null);
  };

  const handleContinue = () => {
    if (!consents.consent_age) {
      // Under 18 exit
      onIneligible();
      return;
    }

    if (!consents.consent_research || !consents.consent_sensitive_data) {
      setValidationError(
        'To participate in this health research study, please confirm research participation and sensitive health data processing.'
      );
      return;
    }

    onAccept(consents);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6 sm:py-8 animate-fadeIn font-sans">
      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-heading font-semibold tracking-wide bg-sage-subtle text-olive border border-sage/40">
          <Shield className="w-3.5 h-3.5" />
          Privacy Notice & Consent
        </span>
      </div>

      <h1 className="text-2xl sm:text-3xl font-heading font-bold text-forest leading-tight mb-3">
        {COPY.consent.title}
      </h1>

      <p className="text-forest/85 text-sm sm:text-base leading-relaxed mb-4">
        {COPY.consent.summary}
      </p>

      {/* Accordion / Key privacy points */}
      <div className="bg-white border border-beige-dark/50 rounded-2xl p-4 sm:p-5 space-y-2.5 mb-6 shadow-subtle text-xs sm:text-sm text-forest/80">
        {COPY.consent.details.map((item, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-olive shrink-0 mt-2" />
            <p className="leading-relaxed">{item}</p>
          </div>
        ))}
      </div>

      {/* Checkboxes Section */}
      <div className="space-y-3 mb-6">
        <h2 className="text-xs uppercase tracking-wider font-heading font-bold text-forest-muted">
          Your voluntary consent
        </h2>

        {/* 1. Age Eligibility */}
        <label
          className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
            consents.consent_age
              ? 'bg-sage-subtle border-olive text-forest ring-1 ring-olive'
              : 'bg-white border-beige-dark/60 hover:border-olive/50'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
              consents.consent_age ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
            }`}
          >
            {consents.consent_age && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
          <div className="flex-1">
            <span className="text-sm sm:text-base font-heading font-medium leading-snug text-forest">
              {COPY.consent.labels.age}
            </span>
            <span className="block text-[11px] text-terracotta font-medium mt-0.5 font-sans">* Required (18+ only)</span>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={consents.consent_age}
            onChange={() => toggleConsent('consent_age')}
          />
        </label>

        {/* 2. Research Participation */}
        <label
          className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
            consents.consent_research
              ? 'bg-sage-subtle border-olive text-forest ring-1 ring-olive'
              : 'bg-white border-beige-dark/60 hover:border-olive/50'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
              consents.consent_research ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
            }`}
          >
            {consents.consent_research && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
          <div className="flex-1">
            <span className="text-sm sm:text-base font-heading font-medium leading-snug text-forest">
              {COPY.consent.labels.research}
            </span>
            <span className="block text-[11px] text-terracotta font-medium mt-0.5 font-sans">* Required</span>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={consents.consent_research}
            onChange={() => toggleConsent('consent_research')}
          />
        </label>

        {/* 3. Sensitive Health Data */}
        <label
          className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
            consents.consent_sensitive_data
              ? 'bg-sage-subtle border-olive text-forest ring-1 ring-olive'
              : 'bg-white border-beige-dark/60 hover:border-olive/50'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
              consents.consent_sensitive_data ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
            }`}
          >
            {consents.consent_sensitive_data && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
          <div className="flex-1">
            <span className="text-sm sm:text-base font-heading font-medium leading-snug text-forest">
              {COPY.consent.labels.sensitive}
            </span>
            <span className="block text-[11px] text-terracotta font-medium mt-0.5 font-sans">* Required</span>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={consents.consent_sensitive_data}
            onChange={() => toggleConsent('consent_sensitive_data')}
          />
        </label>

        {/* 4. Founding 100 Contact (Optional) */}
        <label
          className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
            consents.consent_contact
              ? 'bg-sage-subtle border-olive text-forest ring-1 ring-olive'
              : 'bg-white border-beige-dark/60 hover:border-olive/50'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
              consents.consent_contact ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
            }`}
          >
            {consents.consent_contact && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
          <div className="flex-1">
            <span className="text-sm sm:text-base font-heading font-medium leading-snug text-forest">
              {COPY.consent.labels.contact}
            </span>
            <span className="block text-[11px] text-forest-muted mt-0.5 font-sans">Optional</span>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={consents.consent_contact}
            onChange={() => toggleConsent('consent_contact')}
          />
        </label>

        {/* 5. Updates (Optional) */}
        <label
          className={`w-full p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer select-none ${
            consents.consent_updates
              ? 'bg-sage-subtle border-olive text-forest ring-1 ring-olive'
              : 'bg-white border-beige-dark/60 hover:border-olive/50'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
              consents.consent_updates ? 'border-olive bg-olive text-white' : 'border-forest-subtle/40 bg-white'
            }`}
          >
            {consents.consent_updates && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
          </div>
          <div className="flex-1">
            <span className="text-sm sm:text-base font-heading font-medium leading-snug text-forest">
              {COPY.consent.labels.updates}
            </span>
            <span className="block text-[11px] text-forest-muted mt-0.5 font-sans">Optional</span>
          </div>
          <input
            type="checkbox"
            className="sr-only"
            checked={consents.consent_updates}
            onChange={() => toggleConsent('consent_updates')}
          />
        </label>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div
          role="alert"
          className="p-3.5 mb-5 bg-error-light border border-error-border rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-error font-sans"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-error" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="button"
          onClick={handleContinue}
          className="w-full sm:w-auto px-7 py-3.5 bg-olive text-white font-heading font-semibold text-sm sm:text-base rounded-xl hover:bg-olive-dark active:scale-[0.98] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>{COPY.consent.cta}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-3 rounded-xl text-xs sm:text-sm font-heading font-semibold text-forest-muted hover:text-forest hover:bg-beige/40 transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          <button
            type="button"
            onClick={onDecline}
            className="px-4 py-3 rounded-xl text-xs sm:text-sm font-heading font-semibold text-forest-muted/80 hover:text-terracotta hover:bg-beige/40 transition-colors"
          >
            {COPY.consent.declineCta}
          </button>
        </div>
      </div>
    </div>
  );
};
