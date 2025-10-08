import { z } from 'zod';

const channelEnum = z.enum(['EMAIL', 'SMS', 'VOICE']);
const scopeEnum = z.enum(['PROMOTIONAL', 'TRANSACTIONAL']);
const statusEnum = z.enum(['GRANTED', 'REVOKED', 'UNKNOWN']);

export const consentRecordSchema = z.object({
  channel: channelEnum,
  scope: scopeEnum,
  status: statusEnum,
  verbatimText: z.string(),
  capturedAt: z.coerce.date(),
  revokedAt: z.date().optional(),
  source: z.string(),
  evidenceUri: z.string().optional()
});

export type Channel = z.infer<typeof channelEnum>;
export type Scope = z.infer<typeof scopeEnum>;
export type Status = z.infer<typeof statusEnum>;
export type ConsentRecord = z.infer<typeof consentRecordSchema>;

export interface ConsentCheckOptions {
  channel: Channel;
  scope: Scope;
  records: ConsentRecord[];
  quietHoursStart: number;
  quietHoursEnd: number;
  now?: Date;
  tenantTenDlcReady?: boolean;
  isTransactional?: boolean;
  hasGlobalStop?: boolean;
  overrideQuietHours?: boolean;
}

export interface ConsentCheckResult {
  allowed: boolean;
  reason?: string;
  evidenceRequired?: boolean;
}

const quietHoursReason = (start: number, end: number) =>
  `Quiet hours in effect from ${start}:00 to ${end}:00`;

export const isWithinQuietHours = (
  options: Pick<ConsentCheckOptions, 'quietHoursStart' | 'quietHoursEnd' | 'now'>
) => {
  const { quietHoursStart, quietHoursEnd } = options;
  const now = options.now ?? new Date();
  const hour = now.getHours();
  if (quietHoursStart === quietHoursEnd) return false;
  if (quietHoursStart < quietHoursEnd) {
    return hour >= quietHoursStart && hour < quietHoursEnd;
  }
  return hour >= quietHoursStart || hour < quietHoursEnd;
};

export const selectConsentRecord = (
  records: ConsentRecord[],
  channel: Channel,
  scope: Scope
): ConsentRecord | undefined => {
  const scoped = records.filter((record) => record.channel === channel && record.scope === scope);
  if (scoped.length === 0) return undefined;
  return scoped.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())[0];
};

export const evaluateConsent = (options: ConsentCheckOptions): ConsentCheckResult => {
  const {
    channel,
    scope,
    records,
    quietHoursStart,
    quietHoursEnd,
    now,
    tenantTenDlcReady,
    hasGlobalStop,
    overrideQuietHours,
    isTransactional
  } = options;

  if (hasGlobalStop) {
    return {
      allowed: false,
      reason: 'Channel globally muted by STOP/unsubscribe'
    };
  }

  if (!tenantTenDlcReady && channel === 'SMS') {
    return {
      allowed: false,
      reason: 'Tenant not 10DLC registered; SMS send blocked'
    };
  }

  const consent = selectConsentRecord(records, channel, scope);
  if (!consent) {
    return {
      allowed: false,
      reason: `No ${channel} consent evidence on file for ${scope.toLowerCase()} scope`,
      evidenceRequired: true
    };
  }

  if (consent.status !== 'GRANTED' || consent.revokedAt) {
    return {
      allowed: false,
      reason: `Consent revoked for ${channel}`
    };
  }

  const quietHoursBlocked = isWithinQuietHours({ quietHoursStart, quietHoursEnd, now });
  if (quietHoursBlocked && !overrideQuietHours && channel !== 'EMAIL') {
    return {
      allowed: false,
      reason: quietHoursReason(quietHoursStart, quietHoursEnd)
    };
  }

  if (scope === 'PROMOTIONAL' && !isTransactional) {
    return { allowed: true, evidenceRequired: false };
  }

  return { allowed: true };
};
