import { describe, expect, it } from 'vitest';

import { evaluateConsent } from '../consent';

const baseRecord = {
  channel: 'SMS' as const,
  scope: 'PROMOTIONAL' as const,
  status: 'GRANTED' as const,
  verbatimText: 'Opted in',
  capturedAt: new Date('2024-01-01T00:00:00Z'),
  source: 'test'
};

describe('evaluateConsent', () => {
  it('allows send when consent granted and quiet hours off', () => {
    const result = evaluateConsent({
      channel: 'SMS',
      scope: 'PROMOTIONAL',
      records: [baseRecord],
      quietHoursStart: 21,
      quietHoursEnd: 8,
      now: new Date('2024-03-01T15:00:00Z'),
      tenantTenDlcReady: true
    });

    expect(result.allowed).toBe(true);
  });

  it('blocks when no consent evidence exists', () => {
    const result = evaluateConsent({
      channel: 'SMS',
      scope: 'PROMOTIONAL',
      records: [],
      quietHoursStart: 21,
      quietHoursEnd: 8,
      now: new Date('2024-03-01T15:00:00Z'),
      tenantTenDlcReady: true
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('No SMS consent evidence');
  });

  it('blocks when quiet hours apply and override not provided', () => {
    const result = evaluateConsent({
      channel: 'VOICE',
      scope: 'TRANSACTIONAL',
      records: [{ ...baseRecord, channel: 'VOICE', scope: 'TRANSACTIONAL' }],
      quietHoursStart: 21,
      quietHoursEnd: 8,
      now: new Date('2024-03-01T22:00:00'),
      tenantTenDlcReady: true
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Quiet hours');
  });

  it('blocks SMS sends when tenant lacks 10DLC readiness', () => {
    const result = evaluateConsent({
      channel: 'SMS',
      scope: 'TRANSACTIONAL',
      records: [{ ...baseRecord, scope: 'TRANSACTIONAL' }],
      quietHoursStart: 21,
      quietHoursEnd: 8,
      tenantTenDlcReady: false
    });

    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('10DLC');
  });
});
