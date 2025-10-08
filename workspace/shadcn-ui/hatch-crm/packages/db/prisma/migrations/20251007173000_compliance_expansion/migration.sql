-- Create TourAgreementLink
CREATE TABLE "TourAgreementLink" (
    "tourId" TEXT NOT NULL,
    "agreementId" TEXT NOT NULL,
    "linkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TourAgreementLink_pkey" PRIMARY KEY ("tourId"),
    CONSTRAINT "TourAgreementLink_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TourAgreementLink_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "TourAgreementLink_agreementId_idx" ON "TourAgreementLink"("agreementId");

-- Extend ClearCooperationTimer
ALTER TABLE "ClearCooperationTimer"
    ADD COLUMN "mlsProfileId" TEXT,
    ADD COLUMN "firstPublicMarketingAt" TIMESTAMP(3),
    ADD COLUMN "dueAt" TIMESTAMP(3),
    ADD COLUMN "riskReason" TEXT,
    ADD COLUMN "lastAction" TEXT,
    ADD COLUMN "lastActorId" TEXT;

ALTER TABLE "ClearCooperationTimer"
    ADD CONSTRAINT "ClearCooperationTimer_mlsProfileId_fkey" FOREIGN KEY ("mlsProfileId") REFERENCES "MLSProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ClearCooperationTimer"
    ADD CONSTRAINT "ClearCooperationTimer_lastActorId_fkey" FOREIGN KEY ("lastActorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Extend MLSProfile
ALTER TABLE "MLSProfile"
    ADD COLUMN "requiredPlacement" TEXT DEFAULT 'footer',
    ADD COLUMN "prohibitedFields" JSONB;

-- DisclaimerPolicy table
CREATE TABLE "DisclaimerPolicy" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "mlsProfileId" TEXT NOT NULL,
    "requiredText" TEXT NOT NULL,
    "requiredPlacement" TEXT NOT NULL,
    "compensationRule" TEXT NOT NULL,
    "lastReviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DisclaimerPolicy_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "DisclaimerPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DisclaimerPolicy_mlsProfileId_fkey" FOREIGN KEY ("mlsProfileId") REFERENCES "MLSProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "DisclaimerPolicy_tenant_mls_idx" ON "DisclaimerPolicy"("tenantId", "mlsProfileId");

-- OverrideLog table
CREATE TABLE "OverrideLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "actorUserId" TEXT,
    "context" TEXT NOT NULL,
    "reasonText" TEXT,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OverrideLog_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "OverrideLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OverrideLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "OverrideLog_context_idx" ON "OverrideLog"("tenantId", "context");

-- MarketingEvent table
CREATE TABLE "MarketingEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "listingId" TEXT,
    "mlsProfileId" TEXT,
    "eventType" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT,
    "metadata" JSONB,
    CONSTRAINT "MarketingEvent_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "MarketingEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MarketingEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MarketingEvent_mlsProfileId_fkey" FOREIGN KEY ("mlsProfileId") REFERENCES "MLSProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "MarketingEvent_tenant_occurred_idx" ON "MarketingEvent"("tenantId", "occurredAt");
CREATE INDEX "MarketingEvent_listing_idx" ON "MarketingEvent"("listingId");
CREATE INDEX "MarketingEvent_mls_idx" ON "MarketingEvent"("mlsProfileId");

-- ComplianceStatusDaily table
CREATE TABLE "ComplianceStatusDaily" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "teamId" TEXT,
    "agentId" TEXT,
    "toursTotal" INTEGER NOT NULL DEFAULT 0,
    "toursKept" INTEGER NOT NULL DEFAULT 0,
    "keptWithActiveBba" INTEGER NOT NULL DEFAULT 0,
    "smsGranted" INTEGER NOT NULL DEFAULT 0,
    "smsRevoked" INTEGER NOT NULL DEFAULT 0,
    "emailGranted" INTEGER NOT NULL DEFAULT 0,
    "emailRevoked" INTEGER NOT NULL DEFAULT 0,
    "coopOpen" INTEGER NOT NULL DEFAULT 0,
    "coopOverdue" INTEGER NOT NULL DEFAULT 0,
    "idxFailures" INTEGER NOT NULL DEFAULT 0,
    "idxChecks" INTEGER NOT NULL DEFAULT 0,
    "tenDlcApproved" BOOLEAN NOT NULL DEFAULT false,
    "dmarcAligned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ComplianceStatusDaily_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ComplianceStatusDaily_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ComplianceStatusDaily_unique_idx" ON "ComplianceStatusDaily"("tenantId", "date", "teamId", "agentId");
