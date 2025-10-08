"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simulateJourney = exports.journeySchema = exports.actionSchema = exports.conditionSchema = void 0;
const zod_1 = require("zod");
exports.conditionSchema = zod_1.z.object({
    field: zod_1.z.enum(['source', 'priceBand', 'geography', 'consentStatus']),
    operator: zod_1.z.enum(['equals', 'not_equals', 'in', 'not_in']),
    value: zod_1.z.union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
});
exports.actionSchema = zod_1.z.discriminatedUnion('type', [
    zod_1.z.object({
        type: zod_1.z.literal('assign'),
        targetAgentId: zod_1.z.string().optional(),
        targetTeamId: zod_1.z.string().optional()
    }),
    zod_1.z.object({
        type: zod_1.z.literal('send_message'),
        channel: zod_1.z.enum(['EMAIL', 'SMS']),
        templateId: zod_1.z.string()
    }),
    zod_1.z.object({
        type: zod_1.z.literal('create_task'),
        taskType: zod_1.z.string(),
        dueInHours: zod_1.z.number().optional()
    }),
    zod_1.z.object({
        type: zod_1.z.literal('update_stage'),
        stage: zod_1.z.string()
    })
]);
exports.journeySchema = zod_1.z.object({
    id: zod_1.z.string(),
    name: zod_1.z.string(),
    trigger: zod_1.z.enum(['lead.created', 'consent.captured', 'tour.kept', 'deal.stage_changed']),
    conditions: zod_1.z.array(exports.conditionSchema),
    actions: zod_1.z.array(exports.actionSchema),
    isActive: zod_1.z.boolean().default(true)
});
const evaluateCondition = (condition, value) => {
    if (typeof value === 'undefined' || value === null)
        return false;
    const { operator } = condition;
    if (operator === 'equals' || operator === 'not_equals') {
        const match = String(value) === String(condition.value);
        return operator === 'equals' ? match : !match;
    }
    if (!Array.isArray(condition.value))
        return false;
    const contained = condition.value.includes(String(value));
    return operator === 'in' ? contained : !contained;
};
const simulateJourney = (journey, input) => {
    if (!journey.isActive || journey.trigger !== input.trigger) {
        return {
            matched: false,
            failedConditions: journey.conditions,
            actions: []
        };
    }
    const failed = [];
    for (const condition of journey.conditions) {
        const value = input.context[condition.field];
        if (!evaluateCondition(condition, value)) {
            failed.push(condition);
        }
    }
    if (failed.length > 0) {
        return {
            matched: false,
            failedConditions: failed,
            actions: []
        };
    }
    return {
        matched: true,
        failedConditions: [],
        actions: journey.actions
    };
};
exports.simulateJourney = simulateJourney;
//# sourceMappingURL=journeys.js.map