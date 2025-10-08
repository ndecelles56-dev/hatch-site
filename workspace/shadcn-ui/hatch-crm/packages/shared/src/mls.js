"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateClearCooperation = exports.runPublishingPreflight = exports.publishingPayloadSchema = exports.mlsProfileSchema = void 0;
const date_fns_1 = require("date-fns");
const zod_1 = require("zod");
exports.mlsProfileSchema = zod_1.z.object({
    name: zod_1.z.string(),
    disclaimerText: zod_1.z.string(),
    compensationDisplayRule: zod_1.z.enum(['allowed', 'prohibited', 'conditional']),
    clearCooperationRequired: zod_1.z.boolean(),
    slaHours: zod_1.z.number().int().positive(),
    lastReviewedAt: zod_1.z.coerce.date().optional()
});
exports.publishingPayloadSchema = zod_1.z.object({
    contentType: zod_1.z.enum(['flyer', 'email', 'page']),
    fields: zod_1.z.record(zod_1.z.any()),
    displayedDisclaimer: zod_1.z.string().optional(),
    showsCompensation: zod_1.z.boolean().optional(),
    compensationValue: zod_1.z.string().optional(),
    marketingStart: zod_1.z.coerce.date().optional(),
    listingId: zod_1.z.string().optional()
});
const runPublishingPreflight = (payload, profile) => {
    const violations = [];
    const warnings = [];
    if (!payload.displayedDisclaimer || !payload.displayedDisclaimer.includes(profile.disclaimerText)) {
        violations.push('Required MLS disclaimer text missing or incorrect.');
    }
    if (profile.compensationDisplayRule === 'prohibited' && payload.showsCompensation) {
        violations.push('Compensation display prohibited for this MLS.');
    }
    if (profile.compensationDisplayRule === 'conditional' && payload.showsCompensation && !payload.compensationValue) {
        warnings.push('Compensation shown without value; verify rule conditions.');
    }
    if (profile.clearCooperationRequired &&
        payload.marketingStart &&
        (0, date_fns_1.differenceInHours)(new Date(), payload.marketingStart) > profile.slaHours) {
        violations.push('Clear Cooperation SLA breached; listing must be submitted to MLS.');
    }
    return {
        pass: violations.length === 0,
        violations,
        warnings
    };
};
exports.runPublishingPreflight = runPublishingPreflight;
const evaluateClearCooperation = (startedAt, slaHours) => {
    const elapsed = (0, date_fns_1.differenceInHours)(new Date(), startedAt);
    const remaining = Math.max(slaHours - elapsed, 0);
    let status = 'GREEN';
    if (elapsed >= slaHours) {
        status = 'RED';
    }
    else if (elapsed >= slaHours * 0.75) {
        status = 'YELLOW';
    }
    return {
        status,
        hoursElapsed: elapsed,
        hoursRemaining: remaining
    };
};
exports.evaluateClearCooperation = evaluateClearCooperation;
//# sourceMappingURL=mls.js.map