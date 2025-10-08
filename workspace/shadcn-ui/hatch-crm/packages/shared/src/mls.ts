import { differenceInHours } from 'date-fns';
import { z } from 'zod';

export const mlsProfileSchema = z.object({
  name: z.string(),
  disclaimerText: z.string(),
  compensationDisplayRule: z.enum(['allowed', 'prohibited', 'conditional']),
  clearCooperationRequired: z.boolean(),
  slaHours: z.number().int().positive(),
  lastReviewedAt: z.coerce.date().optional()
});

export const publishingPayloadSchema = z.object({
  contentType: z.enum(['flyer', 'email', 'page']),
  fields: z.record(z.any()),
  displayedDisclaimer: z.string().optional(),
  showsCompensation: z.boolean().optional(),
  compensationValue: z.string().optional(),
  marketingStart: z.coerce.date().optional(),
  listingId: z.string().optional()
});

export type MLSProfileShape = z.infer<typeof mlsProfileSchema>;
export type PublishingPayload = z.infer<typeof publishingPayloadSchema>;

export interface PreflightResult {
  pass: boolean;
  violations: string[];
  warnings: string[];
}

export const runPublishingPreflight = (
  payload: PublishingPayload,
  profile: MLSProfileShape
): PreflightResult => {
  const violations: string[] = [];
  const warnings: string[] = [];

  if (!payload.displayedDisclaimer || !payload.displayedDisclaimer.includes(profile.disclaimerText)) {
    violations.push('Required MLS disclaimer text missing or incorrect.');
  }

  if (profile.compensationDisplayRule === 'prohibited' && payload.showsCompensation) {
    violations.push('Compensation display prohibited for this MLS.');
  }

  if (profile.compensationDisplayRule === 'conditional' && payload.showsCompensation && !payload.compensationValue) {
    warnings.push('Compensation shown without value; verify rule conditions.');
  }

  if (
    profile.clearCooperationRequired &&
    payload.marketingStart &&
    differenceInHours(new Date(), payload.marketingStart) > profile.slaHours
  ) {
    violations.push('Clear Cooperation SLA breached; listing must be submitted to MLS.');
  }

  return {
    pass: violations.length === 0,
    violations,
    warnings
  };
};

export interface ClearCooperationRisk {
  status: 'GREEN' | 'YELLOW' | 'RED';
  hoursElapsed: number;
  hoursRemaining: number;
}

export const evaluateClearCooperation = (
  startedAt: Date,
  slaHours: number
): ClearCooperationRisk => {
  const elapsed = differenceInHours(new Date(), startedAt);
  const remaining = Math.max(slaHours - elapsed, 0);
  let status: ClearCooperationRisk['status'] = 'GREEN';

  if (elapsed >= slaHours) {
    status = 'RED';
  } else if (elapsed >= slaHours * 0.75) {
    status = 'YELLOW';
  }

  return {
    status,
    hoursElapsed: elapsed,
    hoursRemaining: remaining
  };
};
