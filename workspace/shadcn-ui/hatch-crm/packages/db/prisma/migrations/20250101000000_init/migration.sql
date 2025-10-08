-- Enums
CREATE TYPE "UserRole" AS ENUM ('BROKER','TEAM_LEAD','AGENT','ISA','MARKETING','LENDER');
CREATE TYPE "PersonStage" AS ENUM ('NEW','NURTURE','ACTIVE','UNDER_CONTRACT','CLOSED','LOST');
CREATE TYPE "ConsentChannel" AS ENUM ('EMAIL','SMS','VOICE');
CREATE TYPE "ConsentScope" AS ENUM ('PROMOTIONAL','TRANSACTIONAL');
CREATE TYPE "ConsentStatus" AS ENUM ('GRANTED','REVOKED','UNKNOWN');
CREATE TYPE "ListingStatus" AS ENUM ('COMING_SOON','ACTIVE','PENDING','CLOSED','WITHDRAWN');
CREATE TYPE "TourStatus" AS ENUM ('REQUESTED','CONFIRMED','KEPT','NO_SHOW','CANCELLED');
CREATE TYPE "AgreementType" AS ENUM ('BUYER_REP','LISTING');
CREATE TYPE "AgreementStatus" AS ENUM ('DRAFT','SIGNED','EXPIRED');
CREATE TYPE "DealStage" AS ENUM ('OFFER','UNDER_CONTRACT','CLOSED','LOST');
CREATE TYPE "OfferStatus" AS ENUM ('SUBMITTED','COUNTERED','ACCEPTED','REJECTED');
CREATE TYPE "MessageChannel" AS ENUM ('EMAIL','SMS','VOICE');
CREATE TYPE "MessageDirection" AS ENUM ('INBOUND','OUTBOUND');
CREATE TYPE "MessageStatus" AS ENUM ('QUEUED','SENT','DELIVERED','BOUNCED','FAILED','BLOCKED');
CREATE TYPE "ActivityType" AS ENUM ('LEAD_CREATED','CONSENT_CAPTURED','CONSENT_REVOKED','TOUR_REQUESTED','TOUR_CONFIRMED','TOUR_KEPT','AGREEMENT_SIGNED','DEAL_STAGE_CHANGED','MESSAGE_SENT','MESSAGE_FAILED','COMPLIANCE_VIOLATION','ROUTING_ASSIGNED');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING','DELIVERING','SUCCESS','FAILED');
CREATE TYPE "AssignmentReasonType" AS ENUM ('CAPACITY','PERFORMANCE','GEOGRAPHY','PRICE_BAND','CONSENT','TEN_DLC','ROUND_ROBIN','TEAM_POND');
CREATE TYPE "ClearCooperationStatus" AS ENUM ('GREEN','YELLOW','RED');
CREATE TYPE "JourneyTrigger" AS ENUM ('LEAD_CREATED','CONSENT_CAPTURED','TOUR_KEPT','DEAL_STAGE_CHANGED');
CREATE TYPE "JourneyActionType" AS ENUM ('ASSIGN','SEND_MESSAGE','CREATE_TASK','UPDATE_STAGE');

-- Tables
CREATE TABLE "Organization" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Tenant" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
  "quietHoursStart" INTEGER NOT NULL DEFAULT 21,
  "quietHoursEnd" INTEGER NOT NULL DEFAULT 8,
  "tenDlcReady" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tenant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL,
  "avatarUrl" TEXT,
  "timezone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Team" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "TeamMembership" (
  "id" TEXT PRIMARY KEY,
  "teamId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "TeamMembership_teamId_userId_key" UNIQUE ("teamId","userId")
);

CREATE TABLE "Person" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "ownerId" TEXT,
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "primaryEmail" TEXT,
  "primaryPhone" TEXT,
  "stage" "PersonStage" NOT NULL DEFAULT 'NEW',
  "tags" TEXT[] NOT NULL DEFAULT '{}',
  "source" TEXT,
  "leadScore" DOUBLE PRECISION,
  "preferredChannels" "ConsentChannel"[] NOT NULL DEFAULT '{}',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Person_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Person_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Person_tenantId_idx" ON "Person"("tenantId");

CREATE TABLE "Consent" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "channel" "ConsentChannel" NOT NULL,
  "scope" "ConsentScope" NOT NULL,
  "status" "ConsentStatus" NOT NULL DEFAULT 'GRANTED',
  "verbatimText" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "evidenceUri" TEXT,
  "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "revokedAt" TIMESTAMP(3),
  "actorUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Consent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Consent_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Consent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Consent_person_channel_scope_idx" ON "Consent"("personId","channel","scope");

CREATE TABLE "Listing" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT,
  "mlsId" TEXT,
  "status" "ListingStatus" NOT NULL DEFAULT 'COMING_SOON',
  "addressLine1" TEXT NOT NULL,
  "addressLine2" TEXT,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "postalCode" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'USA',
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "price" NUMERIC(65,30),
  "beds" INTEGER,
  "baths" DOUBLE PRECISION,
  "propertyType" TEXT,
  "clearCoopTimerId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Listing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Listing_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Tour" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "agentId" TEXT,
  "status" "TourStatus" NOT NULL DEFAULT 'REQUESTED',
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "source" TEXT,
  "routingScore" DOUBLE PRECISION,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tour_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Tour_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Tour_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Tour_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Agreement" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "type" "AgreementType" NOT NULL,
  "status" "AgreementStatus" NOT NULL DEFAULT 'DRAFT',
  "effectiveDate" TIMESTAMP(3),
  "expiryDate" TIMESTAMP(3),
  "version" INTEGER NOT NULL DEFAULT 1,
  "documentUri" TEXT,
  "signatureLog" JSONB,
  "signedAt" TIMESTAMP(3),
  "overrideUserId" TEXT,
  "overrideReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Agreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Agreement_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Agreement_overrideUserId_fkey" FOREIGN KEY ("overrideUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "Agreement_person_type_status_idx" ON "Agreement"("personId","type","status");

CREATE TABLE "Deal" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "listingId" TEXT,
  "agreementId" TEXT,
  "stage" "DealStage" NOT NULL DEFAULT 'OFFER',
  "forecastGci" NUMERIC(65,30),
  "actualGci" NUMERIC(65,30),
  "splitPlanRef" TEXT,
  "spendToDate" NUMERIC(65,30) DEFAULT 0,
  "expectedNet" NUMERIC(65,30),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Deal_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Deal_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Deal_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Offer" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "dealId" TEXT,
  "status" "OfferStatus" NOT NULL DEFAULT 'SUBMITTED',
  "terms" JSONB NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Offer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Offer_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Offer_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "MLSProfile" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "disclaimerText" TEXT NOT NULL,
  "compensationDisplayRule" TEXT NOT NULL,
  "clearCooperationRequired" BOOLEAN NOT NULL DEFAULT TRUE,
  "slaHours" INTEGER NOT NULL DEFAULT 72,
  "lastReviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MLSProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Message" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT,
  "userId" TEXT,
  "channel" "MessageChannel" NOT NULL,
  "direction" "MessageDirection" NOT NULL,
  "subject" TEXT,
  "body" TEXT,
  "toAddress" TEXT NOT NULL,
  "fromAddress" TEXT NOT NULL,
  "status" "MessageStatus" NOT NULL DEFAULT 'QUEUED',
  "errorCode" TEXT,
  "errorMessage" TEXT,
  "metadata" JSONB,
  "deliveredAt" TIMESTAMP(3),
  "providerMessageId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Message_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Message_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Activity" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT,
  "userId" TEXT,
  "dealId" TEXT,
  "tourId" TEXT,
  "agreementId" TEXT,
  "listingId" TEXT,
  "type" "ActivityType" NOT NULL,
  "payload" JSONB NOT NULL,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Activity_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Activity_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Activity_tourId_fkey" FOREIGN KEY ("tourId") REFERENCES "Tour"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Activity_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Activity_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "Outbox" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "lockedAt" TIMESTAMP(3),
  "nextRetryAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Outbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Assignment" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "agentId" TEXT,
  "teamId" TEXT,
  "score" DOUBLE PRECISION NOT NULL,
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Assignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Assignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Assignment_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Assignment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "AssignmentReason" (
  "id" TEXT PRIMARY KEY,
  "assignmentId" TEXT NOT NULL,
  "type" "AssignmentReasonType" NOT NULL,
  "weight" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  CONSTRAINT "AssignmentReason_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignment"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Journey" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "trigger" "JourneyTrigger" NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "definition" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Journey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "JourneySimulation" (
  "id" TEXT PRIMARY KEY,
  "journeyId" TEXT NOT NULL,
  "input" JSONB NOT NULL,
  "result" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "JourneySimulation_journeyId_fkey" FOREIGN KEY ("journeyId") REFERENCES "Journey"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "CommunicationBlock" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT,
  "channel" "ConsentChannel" NOT NULL,
  "scope" "ConsentScope",
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunicationBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CommunicationBlock_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "CommunicationBlock_person_channel_idx" ON "CommunicationBlock"("personId","channel");

CREATE TABLE "ClearCooperationTimer" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "listingId" TEXT,
  "status" "ClearCooperationStatus" NOT NULL DEFAULT 'GREEN',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deadlineAt" TIMESTAMP(3),
  "lastEventAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClearCooperationTimer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ClearCooperationTimer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "PersonDocument" (
  "id" TEXT PRIMARY KEY,
  "personId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PersonDocument_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "PersonDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "actorUserId" TEXT,
  "entityType" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "DeliverabilityMetric" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "campaignRef" TEXT,
  "agentId" TEXT,
  "channel" "MessageChannel" NOT NULL,
  "accepted" INTEGER NOT NULL DEFAULT 0,
  "delivered" INTEGER NOT NULL DEFAULT 0,
  "bounced" INTEGER NOT NULL DEFAULT 0,
  "complaints" INTEGER NOT NULL DEFAULT 0,
  "optOuts" INTEGER NOT NULL DEFAULT 0,
  "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DeliverabilityMetric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "DeliverabilityMetric_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "DeliverabilityMetric_tenant_agent_channel_date_key" ON "DeliverabilityMetric"("tenantId","agentId","channel","recordedAt");

CREATE TABLE "QuietHourOverride" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT,
  "channel" "ConsentChannel" NOT NULL,
  "reason" TEXT NOT NULL,
  "validUntil" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuietHourOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "QuietHourOverride_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "RoutingLog" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "personId" TEXT NOT NULL,
  "payload" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RoutingLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "RoutingLog_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "WebhookSubscription" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "secret" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "eventTypes" TEXT[] NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "WebhookDelivery" (
  "id" TEXT PRIMARY KEY,
  "webhookId" TEXT NOT NULL,
  "outboxId" TEXT NOT NULL,
  "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lastError" TEXT,
  "deliveredAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "WebhookSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "WebhookDelivery_outboxId_fkey" FOREIGN KEY ("outboxId") REFERENCES "Outbox"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
