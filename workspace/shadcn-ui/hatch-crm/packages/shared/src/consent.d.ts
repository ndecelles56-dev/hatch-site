import { z } from 'zod';
declare const channelEnum: z.ZodEnum<["EMAIL", "SMS", "VOICE"]>;
declare const scopeEnum: z.ZodEnum<["PROMOTIONAL", "TRANSACTIONAL"]>;
declare const statusEnum: z.ZodEnum<["GRANTED", "REVOKED", "UNKNOWN"]>;
export declare const consentRecordSchema: z.ZodObject<{
    channel: z.ZodEnum<["EMAIL", "SMS", "VOICE"]>;
    scope: z.ZodEnum<["PROMOTIONAL", "TRANSACTIONAL"]>;
    status: z.ZodEnum<["GRANTED", "REVOKED", "UNKNOWN"]>;
    verbatimText: z.ZodString;
    capturedAt: z.ZodDate;
    revokedAt: z.ZodOptional<z.ZodDate>;
    source: z.ZodString;
    evidenceUri: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    channel?: "EMAIL" | "SMS" | "VOICE";
    scope?: "PROMOTIONAL" | "TRANSACTIONAL";
    status?: "GRANTED" | "REVOKED" | "UNKNOWN";
    verbatimText?: string;
    capturedAt?: Date;
    revokedAt?: Date;
    source?: string;
    evidenceUri?: string;
}, {
    channel?: "EMAIL" | "SMS" | "VOICE";
    scope?: "PROMOTIONAL" | "TRANSACTIONAL";
    status?: "GRANTED" | "REVOKED" | "UNKNOWN";
    verbatimText?: string;
    capturedAt?: Date;
    revokedAt?: Date;
    source?: string;
    evidenceUri?: string;
}>;
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
export declare const isWithinQuietHours: (options: Pick<ConsentCheckOptions, "quietHoursStart" | "quietHoursEnd" | "now">) => boolean;
export declare const selectConsentRecord: (records: ConsentRecord[], channel: Channel, scope: Scope) => ConsentRecord | undefined;
export declare const evaluateConsent: (options: ConsentCheckOptions) => ConsentCheckResult;
export {};
