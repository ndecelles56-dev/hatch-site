-- Create enums for calendar event classification
CREATE TYPE "CalendarEventType" AS ENUM ('SHOWING', 'MEETING', 'INSPECTION', 'CLOSING', 'FOLLOW_UP', 'MARKETING', 'OTHER');
CREATE TYPE "CalendarEventStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "CalendarEventPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- Calendar events table to power broker CRM scheduling
CREATE TABLE "CalendarEvent" (
  "id" TEXT PRIMARY KEY,
  "tenantId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "startAt" TIMESTAMPTZ NOT NULL,
  "endAt" TIMESTAMPTZ NOT NULL,
  "eventType" "CalendarEventType" NOT NULL DEFAULT 'OTHER',
  "status" "CalendarEventStatus" NOT NULL DEFAULT 'PENDING',
  "priority" "CalendarEventPriority" NOT NULL DEFAULT 'MEDIUM',
  "location" TEXT,
  "notes" TEXT,
  "assignedAgentId" TEXT,
  "personId" TEXT,
  "listingId" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Relationships
ALTER TABLE "CalendarEvent"
  ADD CONSTRAINT "CalendarEvent_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "CalendarEvent"
  ADD CONSTRAINT "CalendarEvent_assignedAgentId_fkey"
  FOREIGN KEY ("assignedAgentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CalendarEvent"
  ADD CONSTRAINT "CalendarEvent_personId_fkey"
  FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "CalendarEvent"
  ADD CONSTRAINT "CalendarEvent_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Helpful indexes
CREATE INDEX "CalendarEvent_tenantId_startAt_idx" ON "CalendarEvent" ("tenantId", "startAt");
CREATE INDEX "CalendarEvent_assignedAgentId_idx" ON "CalendarEvent" ("assignedAgentId");
CREATE INDEX "CalendarEvent_personId_idx" ON "CalendarEvent" ("personId");
