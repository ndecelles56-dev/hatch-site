"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateConsent = exports.selectConsentRecord = exports.isWithinQuietHours = exports.consentRecordSchema = void 0;
const zod_1 = require("zod");
const channelEnum = zod_1.z.enum(['EMAIL', 'SMS', 'VOICE']);
const scopeEnum = zod_1.z.enum(['PROMOTIONAL', 'TRANSACTIONAL']);
const statusEnum = zod_1.z.enum(['GRANTED', 'REVOKED', 'UNKNOWN']);
exports.consentRecordSchema = zod_1.z.object({
    channel: channelEnum,
    scope: scopeEnum,
    status: statusEnum,
    verbatimText: zod_1.z.string(),
    capturedAt: zod_1.z.coerce.date(),
    revokedAt: zod_1.z.date().optional(),
    source: zod_1.z.string(),
    evidenceUri: zod_1.z.string().optional()
});
const quietHoursReason = (start, end) => `Quiet hours in effect from ${start}:00 to ${end}:00`;
const isWithinQuietHours = (options) => {
    const { quietHoursStart, quietHoursEnd } = options;
    const now = options.now ?? new Date();
    const hour = now.getHours();
    if (quietHoursStart === quietHoursEnd)
        return false;
    if (quietHoursStart < quietHoursEnd) {
        return hour >= quietHoursStart && hour < quietHoursEnd;
    }
    return hour >= quietHoursStart || hour < quietHoursEnd;
};
exports.isWithinQuietHours = isWithinQuietHours;
const selectConsentRecord = (records, channel, scope) => {
    const scoped = records.filter((record) => record.channel === channel && record.scope === scope);
    if (scoped.length === 0)
        return undefined;
    return scoped.sort((a, b) => b.capturedAt.getTime() - a.capturedAt.getTime())[0];
};
exports.selectConsentRecord = selectConsentRecord;
const evaluateConsent = (options) => {
    const { channel, scope, records, quietHoursStart, quietHoursEnd, now, tenantTenDlcReady, hasGlobalStop, overrideQuietHours, isTransactional } = options;
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
    const consent = (0, exports.selectConsentRecord)(records, channel, scope);
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
    const quietHoursBlocked = (0, exports.isWithinQuietHours)({ quietHoursStart, quietHoursEnd, now });
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
exports.evaluateConsent = evaluateConsent;
//# sourceMappingURL=consent.js.map