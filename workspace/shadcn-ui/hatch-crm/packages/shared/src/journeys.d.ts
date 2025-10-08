import { z } from 'zod';
type TriggerType = 'lead.created' | 'consent.captured' | 'tour.kept' | 'deal.stage_changed';
export declare const conditionSchema: z.ZodObject<{
    field: z.ZodEnum<["source", "priceBand", "geography", "consentStatus"]>;
    operator: z.ZodEnum<["equals", "not_equals", "in", "not_in"]>;
    value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
}, "strip", z.ZodTypeAny, {
    value?: string | string[];
    field?: "source" | "geography" | "priceBand" | "consentStatus";
    operator?: "equals" | "not_equals" | "in" | "not_in";
}, {
    value?: string | string[];
    field?: "source" | "geography" | "priceBand" | "consentStatus";
    operator?: "equals" | "not_equals" | "in" | "not_in";
}>;
export declare const actionSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"assign">;
    targetAgentId: z.ZodOptional<z.ZodString>;
    targetTeamId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "assign";
    targetAgentId?: string;
    targetTeamId?: string;
}, {
    type?: "assign";
    targetAgentId?: string;
    targetTeamId?: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"send_message">;
    channel: z.ZodEnum<["EMAIL", "SMS"]>;
    templateId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    channel?: "EMAIL" | "SMS";
    type?: "send_message";
    templateId?: string;
}, {
    channel?: "EMAIL" | "SMS";
    type?: "send_message";
    templateId?: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"create_task">;
    taskType: z.ZodString;
    dueInHours: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type?: "create_task";
    taskType?: string;
    dueInHours?: number;
}, {
    type?: "create_task";
    taskType?: string;
    dueInHours?: number;
}>, z.ZodObject<{
    type: z.ZodLiteral<"update_stage">;
    stage: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type?: "update_stage";
    stage?: string;
}, {
    type?: "update_stage";
    stage?: string;
}>]>;
export declare const journeySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    trigger: z.ZodEnum<["lead.created", "consent.captured", "tour.kept", "deal.stage_changed"]>;
    conditions: z.ZodArray<z.ZodObject<{
        field: z.ZodEnum<["source", "priceBand", "geography", "consentStatus"]>;
        operator: z.ZodEnum<["equals", "not_equals", "in", "not_in"]>;
        value: z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString, "many">]>;
    }, "strip", z.ZodTypeAny, {
        value?: string | string[];
        field?: "source" | "geography" | "priceBand" | "consentStatus";
        operator?: "equals" | "not_equals" | "in" | "not_in";
    }, {
        value?: string | string[];
        field?: "source" | "geography" | "priceBand" | "consentStatus";
        operator?: "equals" | "not_equals" | "in" | "not_in";
    }>, "many">;
    actions: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"assign">;
        targetAgentId: z.ZodOptional<z.ZodString>;
        targetTeamId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "assign";
        targetAgentId?: string;
        targetTeamId?: string;
    }, {
        type?: "assign";
        targetAgentId?: string;
        targetTeamId?: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"send_message">;
        channel: z.ZodEnum<["EMAIL", "SMS"]>;
        templateId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        channel?: "EMAIL" | "SMS";
        type?: "send_message";
        templateId?: string;
    }, {
        channel?: "EMAIL" | "SMS";
        type?: "send_message";
        templateId?: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"create_task">;
        taskType: z.ZodString;
        dueInHours: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        type?: "create_task";
        taskType?: string;
        dueInHours?: number;
    }, {
        type?: "create_task";
        taskType?: string;
        dueInHours?: number;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"update_stage">;
        stage: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        type?: "update_stage";
        stage?: string;
    }, {
        type?: "update_stage";
        stage?: string;
    }>]>, "many">;
    isActive: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    id?: string;
    conditions?: {
        value?: string | string[];
        field?: "source" | "geography" | "priceBand" | "consentStatus";
        operator?: "equals" | "not_equals" | "in" | "not_in";
    }[];
    name?: string;
    trigger?: "lead.created" | "consent.captured" | "tour.kept" | "deal.stage_changed";
    actions?: ({
        type?: "assign";
        targetAgentId?: string;
        targetTeamId?: string;
    } | {
        channel?: "EMAIL" | "SMS";
        type?: "send_message";
        templateId?: string;
    } | {
        type?: "create_task";
        taskType?: string;
        dueInHours?: number;
    } | {
        type?: "update_stage";
        stage?: string;
    })[];
    isActive?: boolean;
}, {
    id?: string;
    conditions?: {
        value?: string | string[];
        field?: "source" | "geography" | "priceBand" | "consentStatus";
        operator?: "equals" | "not_equals" | "in" | "not_in";
    }[];
    name?: string;
    trigger?: "lead.created" | "consent.captured" | "tour.kept" | "deal.stage_changed";
    actions?: ({
        type?: "assign";
        targetAgentId?: string;
        targetTeamId?: string;
    } | {
        channel?: "EMAIL" | "SMS";
        type?: "send_message";
        templateId?: string;
    } | {
        type?: "create_task";
        taskType?: string;
        dueInHours?: number;
    } | {
        type?: "update_stage";
        stage?: string;
    })[];
    isActive?: boolean;
}>;
export type JourneyDefinition = z.infer<typeof journeySchema>;
export type JourneyCondition = z.infer<typeof conditionSchema>;
export type JourneyAction = z.infer<typeof actionSchema>;
export interface SimulationInput {
    trigger: TriggerType;
    context: Record<string, unknown>;
}
export interface SimulationResult {
    matched: boolean;
    failedConditions: JourneyCondition[];
    actions: JourneyAction[];
}
export declare const simulateJourney: (journey: JourneyDefinition, input: SimulationInput) => SimulationResult;
export {};
