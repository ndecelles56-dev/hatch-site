import { z } from 'zod';
export declare const leadRoutingModeSchema: z.ZodEnum<["FIRST_MATCH", "SCORE_AND_ASSIGN"]>;
export type LeadRoutingMode = z.infer<typeof leadRoutingModeSchema>;
export declare const leadRoutingConsentStateSchema: z.ZodEnum<["GRANTED", "REVOKED", "UNKNOWN"]>;
export type LeadRoutingConsentState = z.infer<typeof leadRoutingConsentStateSchema>;
export declare const leadRoutingConsentRequirementSchema: z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>;
export type LeadRoutingConsentRequirement = z.infer<typeof leadRoutingConsentRequirementSchema>;
export declare const leadRoutingBuyerRepRequirementSchema: z.ZodEnum<["ANY", "REQUIRED_ACTIVE", "PROHIBIT_ACTIVE"]>;
export type LeadRoutingBuyerRepRequirement = z.infer<typeof leadRoutingBuyerRepRequirementSchema>;
export declare const leadRoutingDaysOfWeekSchema: z.ZodArray<z.ZodNumber, "many">;
export declare const leadRoutingTimeWindowSchema: z.ZodObject<{
    timezone: z.ZodString;
    start: z.ZodString;
    end: z.ZodString;
    days: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
}, "strip", z.ZodTypeAny, {
    timezone?: string;
    start?: string;
    end?: string;
    days?: number[];
}, {
    timezone?: string;
    start?: string;
    end?: string;
    days?: number[];
}>;
export type LeadRoutingTimeWindow = z.infer<typeof leadRoutingTimeWindowSchema>;
export declare const leadRoutingGeographySchema: z.ZodOptional<z.ZodObject<{
    includeStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includeCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    includePostalCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludeStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludeCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    excludePostalCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    includeStates?: string[];
    includeCities?: string[];
    includePostalCodes?: string[];
    excludeStates?: string[];
    excludeCities?: string[];
    excludePostalCodes?: string[];
}, {
    includeStates?: string[];
    includeCities?: string[];
    includePostalCodes?: string[];
    excludeStates?: string[];
    excludeCities?: string[];
    excludePostalCodes?: string[];
}>>;
export type LeadRoutingGeographyCondition = z.infer<typeof leadRoutingGeographySchema>;
export declare const leadRoutingPriceBandSchema: z.ZodOptional<z.ZodObject<{
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    min?: number;
    max?: number;
    currency?: string;
}, {
    min?: number;
    max?: number;
    currency?: string;
}>>;
export type LeadRoutingPriceBandCondition = z.infer<typeof leadRoutingPriceBandSchema>;
export declare const leadRoutingSourceSchema: z.ZodOptional<z.ZodObject<{
    include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    exclude: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    include?: string[];
    exclude?: string[];
}, {
    include?: string[];
    exclude?: string[];
}>>;
export type LeadRoutingSourceCondition = z.infer<typeof leadRoutingSourceSchema>;
export declare const leadRoutingConsentConditionSchema: z.ZodOptional<z.ZodObject<{
    sms: z.ZodOptional<z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>>;
    email: z.ZodOptional<z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>>;
}, "strip", z.ZodTypeAny, {
    sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
    email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
}, {
    sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
    email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
}>>;
export type LeadRoutingConsentCondition = z.infer<typeof leadRoutingConsentConditionSchema>;
export declare const leadRoutingConditionsSchema: z.ZodObject<{
    geography: z.ZodOptional<z.ZodObject<{
        includeStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        includeCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        includePostalCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludeStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludeCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        excludePostalCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        includeStates?: string[];
        includeCities?: string[];
        includePostalCodes?: string[];
        excludeStates?: string[];
        excludeCities?: string[];
        excludePostalCodes?: string[];
    }, {
        includeStates?: string[];
        includeCities?: string[];
        includePostalCodes?: string[];
        excludeStates?: string[];
        excludeCities?: string[];
        excludePostalCodes?: string[];
    }>>;
    priceBand: z.ZodOptional<z.ZodObject<{
        min: z.ZodOptional<z.ZodNumber>;
        max: z.ZodOptional<z.ZodNumber>;
        currency: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        min?: number;
        max?: number;
        currency?: string;
    }, {
        min?: number;
        max?: number;
        currency?: string;
    }>>;
    sources: z.ZodOptional<z.ZodObject<{
        include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        exclude: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        include?: string[];
        exclude?: string[];
    }, {
        include?: string[];
        exclude?: string[];
    }>>;
    consent: z.ZodOptional<z.ZodObject<{
        sms: z.ZodOptional<z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>>;
        email: z.ZodOptional<z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>>;
    }, "strip", z.ZodTypeAny, {
        sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
    }, {
        sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
    }>>;
    buyerRep: z.ZodOptional<z.ZodEnum<["ANY", "REQUIRED_ACTIVE", "PROHIBIT_ACTIVE"]>>;
    timeWindows: z.ZodOptional<z.ZodArray<z.ZodObject<{
        timezone: z.ZodString;
        start: z.ZodString;
        end: z.ZodString;
        days: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
    }, "strip", z.ZodTypeAny, {
        timezone?: string;
        start?: string;
        end?: string;
        days?: number[];
    }, {
        timezone?: string;
        start?: string;
        end?: string;
        days?: number[];
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    consent?: {
        sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
    };
    geography?: {
        includeStates?: string[];
        includeCities?: string[];
        includePostalCodes?: string[];
        excludeStates?: string[];
        excludeCities?: string[];
        excludePostalCodes?: string[];
    };
    priceBand?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    sources?: {
        include?: string[];
        exclude?: string[];
    };
    buyerRep?: "ANY" | "REQUIRED_ACTIVE" | "PROHIBIT_ACTIVE";
    timeWindows?: {
        timezone?: string;
        start?: string;
        end?: string;
        days?: number[];
    }[];
}, {
    consent?: {
        sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
    };
    geography?: {
        includeStates?: string[];
        includeCities?: string[];
        includePostalCodes?: string[];
        excludeStates?: string[];
        excludeCities?: string[];
        excludePostalCodes?: string[];
    };
    priceBand?: {
        min?: number;
        max?: number;
        currency?: string;
    };
    sources?: {
        include?: string[];
        exclude?: string[];
    };
    buyerRep?: "ANY" | "REQUIRED_ACTIVE" | "PROHIBIT_ACTIVE";
    timeWindows?: {
        timezone?: string;
        start?: string;
        end?: string;
        days?: number[];
    }[];
}>;
export type LeadRoutingConditions = z.infer<typeof leadRoutingConditionsSchema>;
export declare const leadRoutingTargetSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"AGENT">;
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "AGENT";
    id?: string;
    label?: string;
}, {
    type?: "AGENT";
    id?: string;
    label?: string;
}>, z.ZodObject<{
    type: z.ZodLiteral<"TEAM">;
    id: z.ZodString;
    strategy: z.ZodDefault<z.ZodEnum<["BEST_FIT", "ROUND_ROBIN"]>>;
    includeRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type?: "TEAM";
    id?: string;
    strategy?: "BEST_FIT" | "ROUND_ROBIN";
    includeRoles?: string[];
}, {
    type?: "TEAM";
    id?: string;
    strategy?: "BEST_FIT" | "ROUND_ROBIN";
    includeRoles?: string[];
}>, z.ZodObject<{
    type: z.ZodLiteral<"POND">;
    id: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type?: "POND";
    id?: string;
    label?: string;
}, {
    type?: "POND";
    id?: string;
    label?: string;
}>]>;
export type LeadRoutingTarget = z.infer<typeof leadRoutingTargetSchema>;
export declare const leadRoutingFallbackSchema: z.ZodOptional<z.ZodObject<{
    teamId: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    escalationChannels: z.ZodOptional<z.ZodArray<z.ZodEnum<["EMAIL", "SMS", "IN_APP"]>, "many">>;
}, "strip", z.ZodTypeAny, {
    label?: string;
    teamId?: string;
    escalationChannels?: ("EMAIL" | "SMS" | "IN_APP")[];
}, {
    label?: string;
    teamId?: string;
    escalationChannels?: ("EMAIL" | "SMS" | "IN_APP")[];
}>>;
export type LeadRoutingFallback = z.infer<typeof leadRoutingFallbackSchema>;
export declare const leadRoutingRuleConfigSchema: z.ZodObject<{
    conditions: z.ZodDefault<z.ZodObject<{
        geography: z.ZodOptional<z.ZodObject<{
            includeStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            includeCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            includePostalCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            excludeStates: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            excludeCities: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            excludePostalCodes: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            includeStates?: string[];
            includeCities?: string[];
            includePostalCodes?: string[];
            excludeStates?: string[];
            excludeCities?: string[];
            excludePostalCodes?: string[];
        }, {
            includeStates?: string[];
            includeCities?: string[];
            includePostalCodes?: string[];
            excludeStates?: string[];
            excludeCities?: string[];
            excludePostalCodes?: string[];
        }>>;
        priceBand: z.ZodOptional<z.ZodObject<{
            min: z.ZodOptional<z.ZodNumber>;
            max: z.ZodOptional<z.ZodNumber>;
            currency: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            min?: number;
            max?: number;
            currency?: string;
        }, {
            min?: number;
            max?: number;
            currency?: string;
        }>>;
        sources: z.ZodOptional<z.ZodObject<{
            include: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            exclude: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            include?: string[];
            exclude?: string[];
        }, {
            include?: string[];
            exclude?: string[];
        }>>;
        consent: z.ZodOptional<z.ZodObject<{
            sms: z.ZodOptional<z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>>;
            email: z.ZodOptional<z.ZodEnum<["OPTIONAL", "GRANTED", "NOT_REVOKED"]>>;
        }, "strip", z.ZodTypeAny, {
            sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
            email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        }, {
            sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
            email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        }>>;
        buyerRep: z.ZodOptional<z.ZodEnum<["ANY", "REQUIRED_ACTIVE", "PROHIBIT_ACTIVE"]>>;
        timeWindows: z.ZodOptional<z.ZodArray<z.ZodObject<{
            timezone: z.ZodString;
            start: z.ZodString;
            end: z.ZodString;
            days: z.ZodOptional<z.ZodArray<z.ZodNumber, "many">>;
        }, "strip", z.ZodTypeAny, {
            timezone?: string;
            start?: string;
            end?: string;
            days?: number[];
        }, {
            timezone?: string;
            start?: string;
            end?: string;
            days?: number[];
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        consent?: {
            sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
            email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        };
        geography?: {
            includeStates?: string[];
            includeCities?: string[];
            includePostalCodes?: string[];
            excludeStates?: string[];
            excludeCities?: string[];
            excludePostalCodes?: string[];
        };
        priceBand?: {
            min?: number;
            max?: number;
            currency?: string;
        };
        sources?: {
            include?: string[];
            exclude?: string[];
        };
        buyerRep?: "ANY" | "REQUIRED_ACTIVE" | "PROHIBIT_ACTIVE";
        timeWindows?: {
            timezone?: string;
            start?: string;
            end?: string;
            days?: number[];
        }[];
    }, {
        consent?: {
            sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
            email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        };
        geography?: {
            includeStates?: string[];
            includeCities?: string[];
            includePostalCodes?: string[];
            excludeStates?: string[];
            excludeCities?: string[];
            excludePostalCodes?: string[];
        };
        priceBand?: {
            min?: number;
            max?: number;
            currency?: string;
        };
        sources?: {
            include?: string[];
            exclude?: string[];
        };
        buyerRep?: "ANY" | "REQUIRED_ACTIVE" | "PROHIBIT_ACTIVE";
        timeWindows?: {
            timezone?: string;
            start?: string;
            end?: string;
            days?: number[];
        }[];
    }>>;
    targets: z.ZodArray<z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
        type: z.ZodLiteral<"AGENT">;
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "AGENT";
        id?: string;
        label?: string;
    }, {
        type?: "AGENT";
        id?: string;
        label?: string;
    }>, z.ZodObject<{
        type: z.ZodLiteral<"TEAM">;
        id: z.ZodString;
        strategy: z.ZodDefault<z.ZodEnum<["BEST_FIT", "ROUND_ROBIN"]>>;
        includeRoles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type?: "TEAM";
        id?: string;
        strategy?: "BEST_FIT" | "ROUND_ROBIN";
        includeRoles?: string[];
    }, {
        type?: "TEAM";
        id?: string;
        strategy?: "BEST_FIT" | "ROUND_ROBIN";
        includeRoles?: string[];
    }>, z.ZodObject<{
        type: z.ZodLiteral<"POND">;
        id: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        type?: "POND";
        id?: string;
        label?: string;
    }, {
        type?: "POND";
        id?: string;
        label?: string;
    }>]>, "many">;
    fallback: z.ZodOptional<z.ZodObject<{
        teamId: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
        escalationChannels: z.ZodOptional<z.ZodArray<z.ZodEnum<["EMAIL", "SMS", "IN_APP"]>, "many">>;
    }, "strip", z.ZodTypeAny, {
        label?: string;
        teamId?: string;
        escalationChannels?: ("EMAIL" | "SMS" | "IN_APP")[];
    }, {
        label?: string;
        teamId?: string;
        escalationChannels?: ("EMAIL" | "SMS" | "IN_APP")[];
    }>>;
}, "strip", z.ZodTypeAny, {
    conditions?: {
        consent?: {
            sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
            email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        };
        geography?: {
            includeStates?: string[];
            includeCities?: string[];
            includePostalCodes?: string[];
            excludeStates?: string[];
            excludeCities?: string[];
            excludePostalCodes?: string[];
        };
        priceBand?: {
            min?: number;
            max?: number;
            currency?: string;
        };
        sources?: {
            include?: string[];
            exclude?: string[];
        };
        buyerRep?: "ANY" | "REQUIRED_ACTIVE" | "PROHIBIT_ACTIVE";
        timeWindows?: {
            timezone?: string;
            start?: string;
            end?: string;
            days?: number[];
        }[];
    };
    targets?: ({
        type?: "AGENT";
        id?: string;
        label?: string;
    } | {
        type?: "TEAM";
        id?: string;
        strategy?: "BEST_FIT" | "ROUND_ROBIN";
        includeRoles?: string[];
    } | {
        type?: "POND";
        id?: string;
        label?: string;
    })[];
    fallback?: {
        label?: string;
        teamId?: string;
        escalationChannels?: ("EMAIL" | "SMS" | "IN_APP")[];
    };
}, {
    conditions?: {
        consent?: {
            sms?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
            email?: "GRANTED" | "OPTIONAL" | "NOT_REVOKED";
        };
        geography?: {
            includeStates?: string[];
            includeCities?: string[];
            includePostalCodes?: string[];
            excludeStates?: string[];
            excludeCities?: string[];
            excludePostalCodes?: string[];
        };
        priceBand?: {
            min?: number;
            max?: number;
            currency?: string;
        };
        sources?: {
            include?: string[];
            exclude?: string[];
        };
        buyerRep?: "ANY" | "REQUIRED_ACTIVE" | "PROHIBIT_ACTIVE";
        timeWindows?: {
            timezone?: string;
            start?: string;
            end?: string;
            days?: number[];
        }[];
    };
    targets?: ({
        type?: "AGENT";
        id?: string;
        label?: string;
    } | {
        type?: "TEAM";
        id?: string;
        strategy?: "BEST_FIT" | "ROUND_ROBIN";
        includeRoles?: string[];
    } | {
        type?: "POND";
        id?: string;
        label?: string;
    })[];
    fallback?: {
        label?: string;
        teamId?: string;
        escalationChannels?: ("EMAIL" | "SMS" | "IN_APP")[];
    };
}>;
export type LeadRoutingRuleConfig = z.infer<typeof leadRoutingRuleConfigSchema>;
export interface LeadRoutingPersonContext {
    source?: string | null;
    buyerRepStatus?: string | null;
    consent: {
        sms: LeadRoutingConsentState;
        email: LeadRoutingConsentState;
    };
}
export interface LeadRoutingListingContext {
    price?: number | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
}
export interface LeadRoutingContext {
    now: Date;
    tenantTimezone: string;
    person: LeadRoutingPersonContext;
    listing?: LeadRoutingListingContext;
}
export interface LeadRoutingConditionCheck {
    key: keyof LeadRoutingConditions;
    passed: boolean;
    detail?: string;
}
export interface LeadRoutingEvaluationResult {
    matched: boolean;
    checks: LeadRoutingConditionCheck[];
}
export declare const evaluateLeadRoutingConditions: (conditions: LeadRoutingConditions | null | undefined, context: LeadRoutingContext) => LeadRoutingEvaluationResult;
export declare const routingConfigSchema: z.ZodObject<{
    minimumScore: z.ZodDefault<z.ZodNumber>;
    performanceWeight: z.ZodDefault<z.ZodNumber>;
    capacityWeight: z.ZodDefault<z.ZodNumber>;
    geographyWeight: z.ZodDefault<z.ZodNumber>;
    priceBandWeight: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    minimumScore?: number;
    performanceWeight?: number;
    capacityWeight?: number;
    geographyWeight?: number;
    priceBandWeight?: number;
}, {
    minimumScore?: number;
    performanceWeight?: number;
    capacityWeight?: number;
    geographyWeight?: number;
    priceBandWeight?: number;
}>;
export type RoutingConfig = z.infer<typeof routingConfigSchema>;
export interface AgentSnapshot {
    userId: string;
    fullName: string;
    capacityTarget: number;
    activePipeline: number;
    geographyFit: number;
    priceBandFit: number;
    keptApptRate: number;
    consentReady: boolean;
    tenDlcReady: boolean;
    teamId?: string;
    roundRobinOrder?: number;
}
export interface RoutingInput {
    leadId: string;
    tenantId: string;
    geographyImportance: number;
    priceBandImportance: number;
    agents: AgentSnapshot[];
    config?: RoutingConfig;
    fallbackTeamId?: string;
    quietHours: boolean;
}
export interface AgentScore {
    userId: string;
    fullName: string;
    score: number;
    reasons: {
        type: 'CAPACITY' | 'PERFORMANCE' | 'GEOGRAPHY' | 'PRICE_BAND' | 'CONSENT' | 'TEN_DLC';
        description: string;
        weight: number;
    }[];
}
export interface RoutingResult {
    leadId: string;
    tenantId: string;
    selectedAgents: AgentScore[];
    fallbackTeamId?: string;
    usedFallback: boolean;
    quietHours: boolean;
}
export declare const scoreAgent: (input: AgentSnapshot, config: RoutingConfig) => AgentScore | null;
export declare const routeLead: (payload: RoutingInput) => RoutingResult;
