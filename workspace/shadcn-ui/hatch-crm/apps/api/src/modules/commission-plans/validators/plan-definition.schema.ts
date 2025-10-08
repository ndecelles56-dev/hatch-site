import { z } from 'zod';

const percentage = z
  .number({ coerce: true })
  .min(0, 'Percentage must be non-negative')
  .max(1, 'Percentage must be between 0 and 1');

const money = z
  .number({ coerce: true })
  .refine((value) => Number.isFinite(value), { message: 'Amount must be a finite number' });

const feeRuleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  beneficiary: z.enum(['BROKERAGE', 'TEAM_LEAD', 'MENTOR', 'AGENT']),
  timing: z.enum(['PRE_CAP', 'POST_CAP', 'ALWAYS']),
  basis: z.enum(['PERCENTAGE', 'FLAT']),
  amount: money,
  applyTo: z.enum(['GCI', 'COMPANY_DOLLAR', 'AGENT_TAKE'])
});

const bonusRuleSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  trigger: z.enum(['DEAL', 'THRESHOLD']),
  basis: z.enum(['PERCENTAGE', 'FLAT']),
  amount: money,
  beneficiary: z.enum(['AGENT', 'BROKERAGE', 'TEAM']),
  notes: z.string().optional()
});

const flatPlanSchema = z.object({
  type: z.literal('FLAT'),
  split: z.object({
    agent: percentage,
    brokerage: percentage
  }),
  fees: feeRuleSchema.array().optional(),
  bonuses: bonusRuleSchema.array().optional(),
  includeReferralInAgentShare: z.boolean().optional()
});

const tierSchema = z.object({
  upToCompanyDollar: money.optional(),
  split: z.object({
    agent: percentage,
    brokerage: percentage
  })
});

const tieredPlanSchema = z.object({
  type: z.literal('TIERED'),
  cap: z.object({
    amount: money,
    reset: z.enum(['ANNUAL', 'ANNIVERSARY']),
    transactionFee: z
      .object({
        type: z.enum(['FLAT', 'PERCENTAGE']),
        amount: money
      })
      .optional()
  }),
  tiers: tierSchema.array().nonempty('At least one tier required'),
  fees: feeRuleSchema.array().optional(),
  bonuses: bonusRuleSchema.array().optional(),
  includeReferralInAgentShare: z.boolean().optional()
});

const capPlanSchema = z.object({
  type: z.literal('CAP'),
  cap: z.object({
    amount: money,
    reset: z.enum(['ANNUAL', 'ANNIVERSARY'])
  }),
  preCapSplit: z.object({
    agent: percentage,
    brokerage: percentage
  }),
  postCap: z.object({
    agent: percentage,
    brokerage: percentage,
    transactionFee: z
      .object({
        type: z.enum(['FLAT', 'PERCENTAGE']),
        amount: money
      })
      .optional()
  }),
  fees: feeRuleSchema.array().optional(),
  bonuses: bonusRuleSchema.array().optional(),
  includeReferralInAgentShare: z.boolean().optional()
});
export const commissionPlanDefinitionSchema = z
  .discriminatedUnion('type', [flatPlanSchema, tieredPlanSchema, capPlanSchema])
  .superRefine((value, ctx) => {
    if (value.type === 'FLAT') {
      const sum = (value.split.agent ?? 0) + (value.split.brokerage ?? 0);
      if (Math.abs(sum - 1) > 0.0001) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Split must sum to 1.0',
          path: ['split']
        });
      }
    }
  });

export type CommissionPlanDefinition = z.infer<typeof commissionPlanDefinitionSchema>;
