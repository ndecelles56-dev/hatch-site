-- Ensure UUID generation extension is available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create team_members table to support broker team roster APIs
CREATE TABLE IF NOT EXISTS "team_members" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "org_id" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT,
  "role" TEXT NOT NULL DEFAULT 'Agent',
  "status" TEXT NOT NULL DEFAULT 'active',
  "experience_years" INTEGER,
  "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_sales" INTEGER NOT NULL DEFAULT 0,
  "deals_in_progress" INTEGER NOT NULL DEFAULT 0,
  "open_leads" INTEGER NOT NULL DEFAULT 0,
  "response_time_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "joined_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "last_active_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT "team_members_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "team_members_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Helpful indexes for common access patterns
CREATE INDEX IF NOT EXISTS "team_members_tenant_id_idx" ON "team_members" ("tenant_id");
CREATE INDEX IF NOT EXISTS "team_members_org_id_idx" ON "team_members" ("org_id");
