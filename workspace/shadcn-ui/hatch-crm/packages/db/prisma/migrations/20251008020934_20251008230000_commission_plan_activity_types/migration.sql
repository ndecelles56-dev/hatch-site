-- Align Person contact uniques with Prisma schema expectations
-- Drop either a legacy unique constraint or partial index before recreating
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Person_tenantId_primaryEmail_key'
      AND conrelid = 'public."Person"'::regclass
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = 'Person_tenantId_primaryEmail_key'
    ) THEN
      EXECUTE 'DROP INDEX "public"."Person_tenantId_primaryEmail_key"';
    END IF;

    EXECUTE '
      ALTER TABLE "public"."Person"
      ADD CONSTRAINT "Person_tenantId_primaryEmail_key"
      UNIQUE ("tenantId", "primaryEmail")
    ';
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Person_tenantId_primaryPhone_key'
      AND conrelid = 'public."Person"'::regclass
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND indexname = 'Person_tenantId_primaryPhone_key'
    ) THEN
      EXECUTE 'DROP INDEX "public"."Person_tenantId_primaryPhone_key"';
    END IF;

    EXECUTE '
      ALTER TABLE "public"."Person"
      ADD CONSTRAINT "Person_tenantId_primaryPhone_key"
      UNIQUE ("tenantId", "primaryPhone")
    ';
  END IF;
END
$$;
