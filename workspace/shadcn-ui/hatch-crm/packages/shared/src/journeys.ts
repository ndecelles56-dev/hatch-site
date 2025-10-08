import { z } from 'zod';

type TriggerType = 'lead.created' | 'consent.captured' | 'tour.kept' | 'deal.stage_changed';

type ConditionOperator = 'equals' | 'not_equals' | 'in' | 'not_in';

type ActionType = 'assign' | 'send_message' | 'create_task' | 'update_stage';

export const conditionSchema = z.object({
  field: z.enum(['source', 'priceBand', 'geography', 'consentStatus']),
  operator: z.enum(['equals', 'not_equals', 'in', 'not_in']),
  value: z.union([z.string(), z.array(z.string())])
});

export const actionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('assign'),
    targetAgentId: z.string().optional(),
    targetTeamId: z.string().optional()
  }),
  z.object({
    type: z.literal('send_message'),
    channel: z.enum(['EMAIL', 'SMS']),
    templateId: z.string()
  }),
  z.object({
    type: z.literal('create_task'),
    taskType: z.string(),
    dueInHours: z.number().optional()
  }),
  z.object({
    type: z.literal('update_stage'),
    stage: z.string()
  })
]);

export const journeySchema = z.object({
  id: z.string(),
  name: z.string(),
  trigger: z.enum(['lead.created', 'consent.captured', 'tour.kept', 'deal.stage_changed']),
  conditions: z.array(conditionSchema),
  actions: z.array(actionSchema),
  isActive: z.boolean().default(true)
});

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

const evaluateCondition = (condition: JourneyCondition, value: unknown): boolean => {
  if (typeof value === 'undefined' || value === null) return false;
  const { operator } = condition;
  if (operator === 'equals' || operator === 'not_equals') {
    const match = String(value) === String(condition.value);
    return operator === 'equals' ? match : !match;
  }

  if (!Array.isArray(condition.value)) return false;
  const contained = condition.value.includes(String(value));
  return operator === 'in' ? contained : !contained;
};

export const simulateJourney = (
  journey: JourneyDefinition,
  input: SimulationInput
): SimulationResult => {
  if (!journey.isActive || journey.trigger !== input.trigger) {
    return {
      matched: false,
      failedConditions: journey.conditions,
      actions: []
    };
  }

  const failed: JourneyCondition[] = [];
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
