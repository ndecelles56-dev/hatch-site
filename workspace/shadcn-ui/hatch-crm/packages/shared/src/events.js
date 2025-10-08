"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.signPayload = exports.makeDomainEvent = exports.domainEventSchema = exports.eventTypes = void 0;
const crypto_1 = require("crypto");
const zod_1 = require("zod");
exports.eventTypes = [
    'conversation.created',
    'lead.created',
    'consent.captured',
    'consent.revoked',
    'agreement.signed',
    'tour.requested',
    'tour.confirmed',
    'tour.kept',
    'lead-routing.assigned',
    'lead-routing.sla.breached',
    'lead-routing.sla.satisfied',
    'offer.submitted',
    'deal.stage_changed',
    'message.sent',
    'message.read',
    'message.failed',
    'compliance.violation_detected'
];
exports.domainEventSchema = zod_1.z.object({
    id: zod_1.z.string().optional(),
    eventType: zod_1.z.enum(exports.eventTypes),
    occurredAt: zod_1.z.string(),
    tenantId: zod_1.z.string(),
    actorId: zod_1.z.string().optional(),
    resource: zod_1.z.object({
        id: zod_1.z.string(),
        type: zod_1.z.string()
    }),
    correlationId: zod_1.z.string().optional(),
    data: zod_1.z.record(zod_1.z.any())
});
const makeDomainEvent = (input) => {
    return exports.domainEventSchema.parse(input);
};
exports.makeDomainEvent = makeDomainEvent;
const signPayload = (payload, secret) => {
    const signature = (0, crypto_1.createHmac)('sha256', secret).update(payload).digest('hex');
    return `sha256=${signature}`;
};
exports.signPayload = signPayload;
//# sourceMappingURL=events.js.map