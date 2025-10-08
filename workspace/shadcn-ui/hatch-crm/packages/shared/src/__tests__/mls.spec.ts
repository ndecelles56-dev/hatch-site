import { describe, expect, it } from 'vitest';

import { runPublishingPreflight } from '../mls';

describe('runPublishingPreflight', () => {
  const profile = {
    name: 'Demo MLS',
    disclaimerText: 'MLS required text',
    compensationDisplayRule: 'allowed' as const,
    clearCooperationRequired: true,
    slaHours: 72
  };

  it('returns violations when disclaimer missing', () => {
    const result = runPublishingPreflight(
      {
        contentType: 'flyer',
        fields: {},
        displayedDisclaimer: '',
        showsCompensation: false,
        marketingStart: new Date()
      },
      profile
    );

    expect(result.pass).toBe(false);
    expect(result.violations).toContain('Required MLS disclaimer text missing or incorrect.');
  });

  it('passes when disclaimer and rules satisfied', () => {
    const result = runPublishingPreflight(
      {
        contentType: 'email',
        fields: {},
        displayedDisclaimer: 'MLS required text',
        showsCompensation: false,
        marketingStart: new Date()
      },
      profile
    );

    expect(result.pass).toBe(true);
  });
});
