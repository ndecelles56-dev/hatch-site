import { z } from 'zod';
export declare const mlsProfileSchema: z.ZodObject<{
    name: z.ZodString;
    disclaimerText: z.ZodString;
    compensationDisplayRule: z.ZodEnum<["allowed", "prohibited", "conditional"]>;
    clearCooperationRequired: z.ZodBoolean;
    slaHours: z.ZodNumber;
    lastReviewedAt: z.ZodOptional<z.ZodDate>;
}, "strip", z.ZodTypeAny, {
    name?: string;
    disclaimerText?: string;
    compensationDisplayRule?: "allowed" | "prohibited" | "conditional";
    clearCooperationRequired?: boolean;
    slaHours?: number;
    lastReviewedAt?: Date;
}, {
    name?: string;
    disclaimerText?: string;
    compensationDisplayRule?: "allowed" | "prohibited" | "conditional";
    clearCooperationRequired?: boolean;
    slaHours?: number;
    lastReviewedAt?: Date;
}>;
export declare const publishingPayloadSchema: z.ZodObject<{
    contentType: z.ZodEnum<["flyer", "email", "page"]>;
    fields: z.ZodRecord<z.ZodString, z.ZodAny>;
    displayedDisclaimer: z.ZodOptional<z.ZodString>;
    showsCompensation: z.ZodOptional<z.ZodBoolean>;
    compensationValue: z.ZodOptional<z.ZodString>;
    marketingStart: z.ZodOptional<z.ZodDate>;
    listingId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    contentType?: "email" | "flyer" | "page";
    fields?: Record<string, any>;
    displayedDisclaimer?: string;
    showsCompensation?: boolean;
    compensationValue?: string;
    marketingStart?: Date;
    listingId?: string;
}, {
    contentType?: "email" | "flyer" | "page";
    fields?: Record<string, any>;
    displayedDisclaimer?: string;
    showsCompensation?: boolean;
    compensationValue?: string;
    marketingStart?: Date;
    listingId?: string;
}>;
export type MLSProfileShape = z.infer<typeof mlsProfileSchema>;
export type PublishingPayload = z.infer<typeof publishingPayloadSchema>;
export interface PreflightResult {
    pass: boolean;
    violations: string[];
    warnings: string[];
}
export declare const runPublishingPreflight: (payload: PublishingPayload, profile: MLSProfileShape) => PreflightResult;
export interface ClearCooperationRisk {
    status: 'GREEN' | 'YELLOW' | 'RED';
    hoursElapsed: number;
    hoursRemaining: number;
}
export declare const evaluateClearCooperation: (startedAt: Date, slaHours: number) => ClearCooperationRisk;
