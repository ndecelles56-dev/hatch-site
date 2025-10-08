import { z } from 'zod';
export declare const eventTypes: readonly ["conversation.created", "lead.created", "consent.captured", "consent.revoked", "agreement.signed", "tour.requested", "tour.confirmed", "tour.kept", "lead-routing.assigned", "lead-routing.sla.breached", "lead-routing.sla.satisfied", "offer.submitted", "deal.stage_changed", "message.sent", "message.read", "message.failed", "compliance.violation_detected"];
export type EventType = (typeof eventTypes)[number];
export declare const domainEventSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodString>;
    eventType: z.ZodEnum<["conversation.created", "lead.created", "consent.captured", "consent.revoked", "agreement.signed", "tour.requested", "tour.confirmed", "tour.kept", "lead-routing.assigned", "lead-routing.sla.breached", "lead-routing.sla.satisfied", "offer.submitted", "deal.stage_changed", "message.sent", "message.read", "message.failed", "compliance.violation_detected"]>;
    occurredAt: z.ZodString;
    tenantId: z.ZodString;
    actorId: z.ZodOptional<z.ZodString>;
    resource: z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: string;
        id?: string;
    }, {
        type?: string;
        id?: string;
    }>;
    correlationId: z.ZodOptional<z.ZodString>;
    data: z.ZodRecord<z.ZodString, z.ZodAny>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    eventType?: "conversation.created" | "lead.created" | "consent.captured" | "consent.revoked" | "agreement.signed" | "tour.requested" | "tour.confirmed" | "tour.kept" | "lead-routing.assigned" | "lead-routing.sla.breached" | "lead-routing.sla.satisfied" | "offer.submitted" | "deal.stage_changed" | "message.sent" | "message.read" | "message.failed" | "compliance.violation_detected";
    occurredAt?: string;
    tenantId?: string;
    actorId?: string;
    resource?: {
        type?: string;
        id?: string;
    };
    correlationId?: string;
    data?: Record<string, any>;
}, {
    id?: string;
    eventType?: "conversation.created" | "lead.created" | "consent.captured" | "consent.revoked" | "agreement.signed" | "tour.requested" | "tour.confirmed" | "tour.kept" | "lead-routing.assigned" | "lead-routing.sla.breached" | "lead-routing.sla.satisfied" | "offer.submitted" | "deal.stage_changed" | "message.sent" | "message.read" | "message.failed" | "compliance.violation_detected";
    occurredAt?: string;
    tenantId?: string;
    actorId?: string;
    resource?: {
        type?: string;
        id?: string;
    };
    correlationId?: string;
    data?: Record<string, any>;
}>;
export type DomainEvent = z.infer<typeof domainEventSchema>;
export declare const makeDomainEvent: (input: DomainEvent) => DomainEvent;
export declare const signPayload: (payload: string, secret: string) => string;
