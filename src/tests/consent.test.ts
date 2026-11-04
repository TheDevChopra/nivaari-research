import { describe, it, expect } from 'vitest';
import { ConsentState } from '../types/research';

function evaluateConsentEligibility(consents: ConsentState): {
  canProceed: boolean;
  isIneligibleAge: boolean;
  isDeclined: boolean;
  reason?: string;
} {
  if (!consents.consent_age) {
    return {
      canProceed: false,
      isIneligibleAge: true,
      isDeclined: false,
      reason: 'Participant must confirm they are 18 years or older.',
    };
  }

  if (!consents.consent_research || !consents.consent_sensitive_data) {
    return {
      canProceed: false,
      isIneligibleAge: false,
      isDeclined: true,
      reason: 'Mandatory research and health-data consent was declined.',
    };
  }

  return {
    canProceed: true,
    isIneligibleAge: false,
    isDeclined: false,
  };
}

describe('Consent & Age Eligibility Rules', () => {
  it('blocks participants who cannot confirm they are 18+', () => {
    const underAgeConsents: ConsentState = {
      consent_age: false,
      consent_research: true,
      consent_sensitive_data: true,
      consent_contact: false,
      consent_updates: false,
    };

    const result = evaluateConsentEligibility(underAgeConsents);
    expect(result.canProceed).toBe(false);
    expect(result.isIneligibleAge).toBe(true);
    expect(result.isDeclined).toBe(false);
  });

  it('stops survey if mandatory research consent is not given', () => {
    const declinedResearch: ConsentState = {
      consent_age: true,
      consent_research: false,
      consent_sensitive_data: true,
      consent_contact: false,
      consent_updates: false,
    };

    const result = evaluateConsentEligibility(declinedResearch);
    expect(result.canProceed).toBe(false);
    expect(result.isIneligibleAge).toBe(false);
    expect(result.isDeclined).toBe(true);
  });

  it('stops survey if sensitive health data processing is declined', () => {
    const declinedSensitive: ConsentState = {
      consent_age: true,
      consent_research: true,
      consent_sensitive_data: false,
      consent_contact: false,
      consent_updates: false,
    };

    const result = evaluateConsentEligibility(declinedSensitive);
    expect(result.canProceed).toBe(false);
    expect(result.isIneligibleAge).toBe(false);
    expect(result.isDeclined).toBe(true);
  });

  it('allows entry when all required consents are checked, even if optional are unchecked', () => {
    const validMinimalConsents: ConsentState = {
      consent_age: true,
      consent_research: true,
      consent_sensitive_data: true,
      consent_contact: false,
      consent_updates: false,
    };

    const result = evaluateConsentEligibility(validMinimalConsents);
    expect(result.canProceed).toBe(true);
    expect(result.isIneligibleAge).toBe(false);
    expect(result.isDeclined).toBe(false);
  });
});

