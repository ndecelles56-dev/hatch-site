/*
  Warnings:

  - You are about to drop the column `clearCoopTimerId` on the `Listing` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[listingId]` on the table `ClearCooperationTimer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,primaryEmail]` on the table `Person` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tenantId,primaryPhone]` on the table `Person` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "RoutingMode" AS ENUM ('FIRST_MATCH', 'SCORE_AND_ASSIGN');

-- CreateEnum
CREATE TYPE "LeadSlaType" AS ENUM ('FIRST_TOUCH', 'KEPT_APPOINTMENT');

-- CreateEnum
CREATE TYPE "ContactSource" AS ENUM ('MANUAL', 'CSV_IMPORT', 'PORTAL', 'OPEN_HOUSE', 'API', 'REFERRAL');

-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Agreement" DROP CONSTRAINT "Agreement_personId_fkey";

-- DropForeignKey
ALTER TABLE "Agreement" DROP CONSTRAINT "Agreement_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_personId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "AuditLog" DROP CONSTRAINT "AuditLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ClearCooperationTimer" DROP CONSTRAINT "ClearCooperationTimer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "CommunicationBlock" DROP CONSTRAINT "CommunicationBlock_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ComplianceStatusDaily" DROP CONSTRAINT "ComplianceStatusDaily_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_personId_fkey";

-- DropForeignKey
ALTER TABLE "Consent" DROP CONSTRAINT "Consent_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ContactMergeProposal" DROP CONSTRAINT "ContactMergeProposal_existingPersonId_fkey";

-- DropForeignKey
ALTER TABLE "ContactMergeProposal" DROP CONSTRAINT "ContactMergeProposal_proposedByUserId_fkey";

-- DropForeignKey
ALTER TABLE "ContactMergeProposal" DROP CONSTRAINT "ContactMergeProposal_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Conversation" DROP CONSTRAINT "Conversation_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_personId_fkey";

-- DropForeignKey
ALTER TABLE "ConversationParticipant" DROP CONSTRAINT "ConversationParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_personId_fkey";

-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "DeliverabilityMetric" DROP CONSTRAINT "DeliverabilityMetric_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "DisclaimerPolicy" DROP CONSTRAINT "DisclaimerPolicy_mlsProfileId_fkey";

-- DropForeignKey
ALTER TABLE "DisclaimerPolicy" DROP CONSTRAINT "DisclaimerPolicy_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Journey" DROP CONSTRAINT "Journey_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "MLSProfile" DROP CONSTRAINT "MLSProfile_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "MarketingEvent" DROP CONSTRAINT "MarketingEvent_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_personId_fkey";

-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Outbox" DROP CONSTRAINT "Outbox_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "OverrideLog" DROP CONSTRAINT "OverrideLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Person" DROP CONSTRAINT "Person_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "PersonDocument" DROP CONSTRAINT "PersonDocument_personId_fkey";

-- DropForeignKey
ALTER TABLE "PersonDocument" DROP CONSTRAINT "PersonDocument_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "QuietHourOverride" DROP CONSTRAINT "QuietHourOverride_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "RoutingLog" DROP CONSTRAINT "RoutingLog_personId_fkey";

-- DropForeignKey
ALTER TABLE "RoutingLog" DROP CONSTRAINT "RoutingLog_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "SavedView" DROP CONSTRAINT "SavedView_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "SavedView" DROP CONSTRAINT "SavedView_userId_fkey";

-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMembership" DROP CONSTRAINT "TeamMembership_teamId_fkey";

-- DropForeignKey
ALTER TABLE "TeamMembership" DROP CONSTRAINT "TeamMembership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Tenant" DROP CONSTRAINT "Tenant_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "Tour" DROP CONSTRAINT "Tour_listingId_fkey";

-- DropForeignKey
ALTER TABLE "Tour" DROP CONSTRAINT "Tour_personId_fkey";

-- DropForeignKey
ALTER TABLE "Tour" DROP CONSTRAINT "Tour_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_outboxId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookDelivery" DROP CONSTRAINT "WebhookDelivery_webhookId_fkey";

-- DropForeignKey
ALTER TABLE "WebhookSubscription" DROP CONSTRAINT "WebhookSubscription_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "team_members" DROP CONSTRAINT "team_members_tenant_id_fkey";

-- DropIndex
DROP INDEX "Person_tenantId_idx";

-- AlterTable
ALTER TABLE "Agreement" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CalendarEvent" ALTER COLUMN "startAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ClearCooperationTimer" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ComplianceStatusDaily" ALTER COLUMN "date" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Consent" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ContactMergeProposal" ALTER COLUMN "resolvedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "archivedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "ConversationParticipant" ALTER COLUMN "joinedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastReadAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DisclaimerPolicy" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Journey" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "clearCoopTimerId",
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MLSProfile" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MessageAttachment" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "MessageReceipt" ALTER COLUMN "recordedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Offer" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Outbox" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Person" ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "lastActivityAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deletedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SavedView" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" DROP DEFAULT,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tenant" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Tour" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "WebhookSubscription" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "team_members" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "joined_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "last_active_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- CreateTable
CREATE TABLE "RoutingRule" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "mode" "RoutingMode" NOT NULL DEFAULT 'FIRST_MATCH',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL,
    "targets" JSONB NOT NULL,
    "fallback" JSONB,
    "slaFirstTouchMinutes" INTEGER,
    "slaKeptAppointmentMinutes" INTEGER,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoutingRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadRouteEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "personId" TEXT,
    "matchedRuleId" TEXT,
    "mode" "RoutingMode" NOT NULL,
    "payload" JSONB NOT NULL,
    "candidates" JSONB NOT NULL,
    "assignedAgentId" TEXT,
    "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
    "reasonCodes" JSONB,
    "slaDueAt" TIMESTAMP(3),
    "slaSatisfiedAt" TIMESTAMP(3),
    "slaBreachedAt" TIMESTAMP(3),
    "actorUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadRouteEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSlaTimer" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "assignedAgentId" TEXT,
    "ruleId" TEXT,
    "type" "LeadSlaType" NOT NULL DEFAULT 'FIRST_TOUCH',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dueAt" TIMESTAMP(3) NOT NULL,
    "satisfiedAt" TIMESTAMP(3),
    "breachedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadSlaTimer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RoutingRule_tenantId_priority_idx" ON "RoutingRule"("tenantId", "priority");

-- CreateIndex
CREATE INDEX "LeadRouteEvent_tenantId_createdAt_idx" ON "LeadRouteEvent"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "LeadRouteEvent_tenantId_leadId_idx" ON "LeadRouteEvent"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "LeadSlaTimer_tenantId_leadId_idx" ON "LeadSlaTimer"("tenantId", "leadId");

-- CreateIndex
CREATE INDEX "LeadSlaTimer_tenantId_status_idx" ON "LeadSlaTimer"("tenantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ClearCooperationTimer_listingId_key" ON "ClearCooperationTimer"("listingId");

-- CreateIndex
DO $$
BEGIN
  IF current_schema = 'public' AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Person_tenantId_primaryEmail_key'
  ) THEN
    CREATE UNIQUE INDEX "Person_tenantId_primaryEmail_key"
      ON "Person"("tenantId", "primaryEmail")
      WHERE "primaryEmail" IS NOT NULL;
  END IF;
END
$$;

-- CreateIndex
DO $$
BEGIN
  IF current_schema = 'public' AND NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'Person_tenantId_primaryPhone_key'
  ) THEN
    CREATE UNIQUE INDEX "Person_tenantId_primaryPhone_key"
      ON "Person"("tenantId", "primaryPhone")
      WHERE "primaryPhone" IS NOT NULL;
  END IF;
END
$$;

-- AddForeignKey
ALTER TABLE "Tenant" ADD CONSTRAINT "Tenant_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Person" ADD CONSTRAINT "Person_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SavedView" ADD CONSTRAINT "SavedView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMergeProposal" ADD CONSTRAINT "ContactMergeProposal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMergeProposal" ADD CONSTRAINT "ContactMergeProposal_existingPersonId_fkey" FOREIGN KEY ("existingPersonId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactMergeProposal" ADD CONSTRAINT "ContactMergeProposal_proposedByUserId_fkey" FOREIGN KEY ("proposedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MLSProfile" ADD CONSTRAINT "MLSProfile_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclaimerPolicy" ADD CONSTRAINT "DisclaimerPolicy_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DisclaimerPolicy" ADD CONSTRAINT "DisclaimerPolicy_mlsProfileId_fkey" FOREIGN KEY ("mlsProfileId") REFERENCES "MLSProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OverrideLog" ADD CONSTRAINT "OverrideLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketingEvent" ADD CONSTRAINT "MarketingEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceStatusDaily" ADD CONSTRAINT "ComplianceStatusDaily_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingRule" ADD CONSTRAINT "RoutingRule_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingRule" ADD CONSTRAINT "RoutingRule_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadRouteEvent" ADD CONSTRAINT "LeadRouteEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadRouteEvent" ADD CONSTRAINT "LeadRouteEvent_matchedRuleId_fkey" FOREIGN KEY ("matchedRuleId") REFERENCES "RoutingRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadRouteEvent" ADD CONSTRAINT "LeadRouteEvent_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSlaTimer" ADD CONSTRAINT "LeadSlaTimer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadSlaTimer" ADD CONSTRAINT "LeadSlaTimer_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "RoutingRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationParticipant" ADD CONSTRAINT "ConversationParticipant_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outbox" ADD CONSTRAINT "Outbox_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Journey" ADD CONSTRAINT "Journey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunicationBlock" ADD CONSTRAINT "CommunicationBlock_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClearCooperationTimer" ADD CONSTRAINT "ClearCooperationTimer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonDocument" ADD CONSTRAINT "PersonDocument_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonDocument" ADD CONSTRAINT "PersonDocument_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliverabilityMetric" ADD CONSTRAINT "DeliverabilityMetric_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuietHourOverride" ADD CONSTRAINT "QuietHourOverride_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingLog" ADD CONSTRAINT "RoutingLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutingLog" ADD CONSTRAINT "RoutingLog_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookSubscription" ADD CONSTRAINT "WebhookSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "WebhookSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WebhookDelivery" ADD CONSTRAINT "WebhookDelivery_outboxId_fkey" FOREIGN KEY ("outboxId") REFERENCES "Outbox"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Agreement_person_type_status_idx" RENAME TO "Agreement_personId_type_status_idx";

-- RenameIndex
ALTER INDEX "CommunicationBlock_person_channel_idx" RENAME TO "CommunicationBlock_personId_channel_idx";

-- RenameIndex
ALTER INDEX "ComplianceStatusDaily_unique_idx" RENAME TO "ComplianceStatusDaily_tenantId_date_teamId_agentId_key";

-- RenameIndex
ALTER INDEX "Consent_person_channel_scope_idx" RENAME TO "Consent_personId_channel_scope_idx";

-- RenameIndex
ALTER INDEX "ContactMergeProposal_tenant_status_idx" RENAME TO "ContactMergeProposal_tenantId_status_idx";

-- RenameIndex
ALTER INDEX "Conversation_tenant_person_idx" RENAME TO "Conversation_tenantId_personId_idx";

-- RenameIndex
ALTER INDEX "Conversation_tenant_type_idx" RENAME TO "Conversation_tenantId_type_idx";

-- RenameIndex
ALTER INDEX "Conversation_tenant_updated_idx" RENAME TO "Conversation_tenantId_updatedAt_idx";

-- RenameIndex
ALTER INDEX "ConversationParticipant_conversation_person_idx" RENAME TO "ConversationParticipant_conversationId_personId_idx";

-- RenameIndex
ALTER INDEX "ConversationParticipant_conversation_role_idx" RENAME TO "ConversationParticipant_conversationId_role_idx";

-- RenameIndex
ALTER INDEX "ConversationParticipant_conversation_user_idx" RENAME TO "ConversationParticipant_conversationId_userId_idx";

-- RenameIndex
ALTER INDEX "DeliverabilityMetric_tenant_agent_channel_date_key" RENAME TO "DeliverabilityMetric_tenantId_agentId_channel_recordedAt_key";

-- RenameIndex
ALTER INDEX "DisclaimerPolicy_tenant_mls_idx" RENAME TO "DisclaimerPolicy_tenantId_mlsProfileId_idx";

-- RenameIndex
ALTER INDEX "MarketingEvent_listing_idx" RENAME TO "MarketingEvent_listingId_idx";

-- RenameIndex
ALTER INDEX "MarketingEvent_mls_idx" RENAME TO "MarketingEvent_mlsProfileId_idx";

-- RenameIndex
ALTER INDEX "MarketingEvent_tenant_occurred_idx" RENAME TO "MarketingEvent_tenantId_occurredAt_idx";

-- RenameIndex
ALTER INDEX "MessageReceipt_message_participant_status_key" RENAME TO "MessageReceipt_messageId_participantId_status_key";

-- RenameIndex
ALTER INDEX "MessageReceipt_participant_status_idx" RENAME TO "MessageReceipt_participantId_status_idx";

-- RenameIndex
ALTER INDEX "OverrideLog_context_idx" RENAME TO "OverrideLog_tenantId_context_idx";

-- RenameIndex
ALTER INDEX "SavedView_user_name_key" RENAME TO "SavedView_userId_name_key";
