-- Broker/Agent subscription + RBAC overhaul
BEGIN;

-- Ensure cryptographic functions for PII encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enumerations for global roles and org governance
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'global_role') THEN
        CREATE TYPE public.global_role AS ENUM ('SUPER_ADMIN', 'SUPPORT_ADMIN', 'USER');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_type') THEN
        CREATE TYPE public.org_type AS ENUM ('brokerage', 'personal');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_status') THEN
        CREATE TYPE public.org_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'suspended');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_member_role') THEN
        CREATE TYPE public.org_member_role AS ENUM ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT', 'PENDING');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'org_member_status') THEN
        CREATE TYPE public.org_member_status AS ENUM ('active', 'invited', 'inactive', 'removed');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_product') THEN
        CREATE TYPE public.subscription_product AS ENUM ('agent_solo', 'brokerage');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_interval') THEN
        CREATE TYPE public.subscription_interval AS ENUM ('monthly', 'yearly');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_state') THEN
        CREATE TYPE public.subscription_state AS ENUM (
            'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'
        );
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_type') THEN
        CREATE TYPE public.license_type AS ENUM ('agent', 'brokerage');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'license_status') THEN
        CREATE TYPE public.license_status AS ENUM ('unverified', 'pending', 'verified', 'rejected');
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invite_status') THEN
        CREATE TYPE public.invite_status AS ENUM ('sent', 'accepted', 'revoked', 'expired');
    END IF;
END
$$;

-- Profiles now carry global role context
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS global_role public.global_role NOT NULL DEFAULT 'USER',
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS active_org_id UUID,
    ADD COLUMN IF NOT EXISTS display_name TEXT,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT,
    ADD COLUMN IF NOT EXISTS bio TEXT,
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS license_number TEXT,
    ADD COLUMN IF NOT EXISTS verified_investor BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc', now());

-- Rename legacy firm tables into org nomenclature
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'firms')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'orgs') THEN
        ALTER TABLE public.firms RENAME TO orgs;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'firm_memberships')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_members') THEN
        ALTER TABLE public.firm_memberships RENAME TO org_members;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subscriptions')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_subscriptions') THEN
        ALTER TABLE public.subscriptions RENAME TO org_subscriptions;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'invitations')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_invitations') THEN
        ALTER TABLE public.invitations RENAME TO org_invitations;
    END IF;
END
$$;

-- Align orgs columns to new schema
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'orgs'
          AND column_name = 'primary_broker_id'
    ) THEN
        ALTER TABLE public.orgs RENAME COLUMN primary_broker_id TO owner_user_id;
    END IF;
END
$$;

-- Drop legacy org policies before altering definitions
DROP POLICY IF EXISTS "allow_read_own_firm" ON public.orgs;
DROP POLICY IF EXISTS "allow_primary_broker_update_firm" ON public.orgs;
DROP POLICY IF EXISTS "allow_create_firm" ON public.orgs;

ALTER TABLE public.orgs
    ADD COLUMN IF NOT EXISTS type public.org_type NOT NULL DEFAULT 'brokerage',
    ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
    ADD COLUMN IF NOT EXISTS billing_email TEXT,
    ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Convert org status to enum
ALTER TABLE public.orgs
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.orgs
    ALTER COLUMN status TYPE public.org_status USING (
        CASE
            WHEN status IN ('active', 'trialing', 'past_due', 'canceled', 'suspended') THEN status::public.org_status
            ELSE 'active'::public.org_status
        END
    );

ALTER TABLE public.orgs
    ALTER COLUMN status SET DEFAULT 'active';

ALTER TABLE public.orgs
    ALTER COLUMN owner_user_id DROP NOT NULL;

CREATE INDEX IF NOT EXISTS orgs_owner_user_idx ON public.orgs(owner_user_id);
CREATE INDEX IF NOT EXISTS orgs_type_idx ON public.orgs(type);
CREATE INDEX IF NOT EXISTS orgs_status_idx ON public.orgs(status);

-- Org members reshape
-- Drop legacy policies that depend on role/status before altering types
DROP POLICY IF EXISTS "allow_read_own_membership" ON public.org_members;
DROP POLICY IF EXISTS "allow_primary_broker_manage_memberships" ON public.org_members;
DROP POLICY IF EXISTS "allow_primary_broker_manage_subscription" ON public.org_subscriptions;
DROP POLICY IF EXISTS "allow_read_own_subscription" ON public.org_subscriptions;
DROP POLICY IF EXISTS "allow_read_firm_invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "allow_primary_broker_manage_invitations" ON public.org_invitations;
DROP POLICY IF EXISTS "listing_drafts_broker_read" ON public.listing_drafts;
DROP POLICY IF EXISTS "listing_drafts_broker_mutate" ON public.listing_drafts;
DROP POLICY IF EXISTS "properties_broker_read" ON public.properties;
DROP POLICY IF EXISTS "properties_broker_modify" ON public.properties;
DROP POLICY IF EXISTS "properties_public_live_read" ON public.properties;
DROP POLICY IF EXISTS "properties_authenticated_live_read" ON public.properties;
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_members'
          AND column_name = 'firm_id'
    ) THEN
        ALTER TABLE public.org_members RENAME COLUMN firm_id TO org_id;
    END IF;
END
$$;
ALTER TABLE public.org_members DROP CONSTRAINT IF EXISTS firm_memberships_role_check;
ALTER TABLE public.org_members DROP CONSTRAINT IF EXISTS firm_memberships_status_check;

-- Normalize membership roles and statuses
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_members' AND column_name = 'role') THEN
        UPDATE public.org_members
        SET role = CASE role
            WHEN 'primary_broker' THEN 'BROKER_OWNER'
            WHEN 'admin' THEN 'BROKER_MANAGER'
            WHEN 'agent' THEN 'AGENT'
            ELSE 'PENDING'
        END
        WHERE role IS NOT NULL
          AND role NOT IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT', 'PENDING');
    END IF;

    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'org_members' AND column_name = 'status') THEN
        UPDATE public.org_members
        SET status = CASE status
            WHEN 'pending' THEN 'invited'
            WHEN 'active' THEN 'active'
            WHEN 'inactive' THEN 'inactive'
            ELSE 'inactive'
        END
        WHERE status IS NOT NULL
          AND status NOT IN ('active', 'invited', 'inactive', 'removed');
    END IF;
END
$$;

ALTER TABLE public.org_members
    ALTER COLUMN role DROP DEFAULT;

ALTER TABLE public.org_members
    ALTER COLUMN role TYPE public.org_member_role USING (
        CASE
            WHEN role IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT', 'PENDING') THEN role::public.org_member_role
            WHEN role = 'primary_broker' THEN 'BROKER_OWNER'::public.org_member_role
            WHEN role = 'admin' THEN 'BROKER_MANAGER'::public.org_member_role
            WHEN role = 'agent' THEN 'AGENT'::public.org_member_role
            ELSE 'PENDING'::public.org_member_role
        END
    );

ALTER TABLE public.org_members
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.org_members
    ALTER COLUMN status TYPE public.org_member_status USING (
        CASE
            WHEN status IN ('active', 'invited', 'inactive', 'removed') THEN status::public.org_member_status
            WHEN status = 'pending' THEN 'invited'::public.org_member_status
            ELSE 'inactive'::public.org_member_status
        END
    );

ALTER TABLE public.org_members
    ALTER COLUMN role SET DEFAULT 'PENDING';

ALTER TABLE public.org_members
    ALTER COLUMN status SET DEFAULT 'invited';

ALTER TABLE public.org_members
    ADD COLUMN IF NOT EXISTS can_manage_billing BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS invited_by UUID,
    ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS removed_at TIMESTAMPTZ;

ALTER TABLE public.org_members
    ADD CONSTRAINT org_members_unique_member UNIQUE (org_id, user_id);

CREATE INDEX IF NOT EXISTS org_members_org_idx ON public.org_members(org_id);
CREATE INDEX IF NOT EXISTS org_members_user_idx ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS org_members_role_idx ON public.org_members(role);
CREATE INDEX IF NOT EXISTS org_members_status_idx ON public.org_members(status);

-- Invitations restructure
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_invitations'
          AND column_name = 'firm_id'
    ) THEN
        ALTER TABLE public.org_invitations RENAME COLUMN firm_id TO org_id;
    END IF;
END
$$;

ALTER TABLE public.org_invitations
    ADD COLUMN IF NOT EXISTS status public.invite_status NOT NULL DEFAULT 'sent',
    ADD COLUMN IF NOT EXISTS invited_member_id UUID REFERENCES public.org_members(id),
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_invitations'
          AND column_name = 'role'
    ) THEN
        ALTER TABLE public.org_invitations
            ALTER COLUMN role DROP DEFAULT;

        ALTER TABLE public.org_invitations
            ALTER COLUMN role TYPE public.org_member_role USING (
                CASE
                    WHEN role IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT') THEN role::public.org_member_role
                    WHEN role = 'admin' THEN 'BROKER_MANAGER'::public.org_member_role
                    WHEN role = 'agent' THEN 'AGENT'::public.org_member_role
                    WHEN role = 'primary_broker' THEN 'BROKER_OWNER'::public.org_member_role
                    ELSE 'AGENT'::public.org_member_role
                END
            );

        ALTER TABLE public.org_invitations
            ALTER COLUMN role SET DEFAULT 'AGENT';
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS org_invitations_org_idx ON public.org_invitations(org_id);
CREATE INDEX IF NOT EXISTS org_invitations_email_idx ON public.org_invitations(email);
CREATE INDEX IF NOT EXISTS org_invitations_status_idx ON public.org_invitations(status);

-- Subscription table adjustments
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_subscriptions'
          AND column_name = 'firm_id'
    ) THEN
        ALTER TABLE public.org_subscriptions RENAME COLUMN firm_id TO org_id;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_subscriptions'
          AND column_name = 'tier'
    ) THEN
        ALTER TABLE public.org_subscriptions RENAME COLUMN tier TO legacy_tier;
    END IF;
END
$$;

ALTER TABLE public.org_subscriptions
    ADD COLUMN IF NOT EXISTS product public.subscription_product DEFAULT 'brokerage',
    ADD COLUMN IF NOT EXISTS plan_interval public.subscription_interval DEFAULT 'monthly',
    ADD COLUMN IF NOT EXISTS price_id TEXT,
    ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS grace_period_ends_at TIMESTAMPTZ;

ALTER TABLE public.org_subscriptions
    DROP COLUMN IF EXISTS plan_id;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'org_subscriptions'
          AND column_name = 'legacy_tier'
    ) THEN
        UPDATE public.org_subscriptions
        SET product = CASE legacy_tier
            WHEN 'basic' THEN 'agent_solo'
            WHEN 'professional' THEN 'brokerage'
            WHEN 'enterprise' THEN 'brokerage'
            WHEN 'growth' THEN 'brokerage'
            ELSE COALESCE(product, 'brokerage')
        END
        WHERE legacy_tier IS NOT NULL;

        ALTER TABLE public.org_subscriptions
            DROP COLUMN legacy_tier;
    END IF;
END
$$;

ALTER TABLE public.org_subscriptions
    ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.org_subscriptions
    ALTER COLUMN status TYPE public.subscription_state USING (
        CASE
            WHEN status IN (
                'active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid'
            ) THEN status::public.subscription_state
            WHEN status = 'inactive' THEN 'canceled'::public.subscription_state
            ELSE 'active'::public.subscription_state
        END
    );

ALTER TABLE public.org_subscriptions
    ALTER COLUMN status SET DEFAULT 'active';

CREATE INDEX IF NOT EXISTS org_subscriptions_org_idx ON public.org_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS org_subscriptions_status_idx ON public.org_subscriptions(status);
CREATE INDEX IF NOT EXISTS org_subscriptions_product_idx ON public.org_subscriptions(product);

-- New license table with encryption-ready columns
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type public.license_type NOT NULL,
    state TEXT NOT NULL,
    license_number_encrypted BYTEA NOT NULL,
    license_number_last4 TEXT,
    license_number_hash TEXT,
    status public.license_status NOT NULL DEFAULT 'unverified',
    verification_notes TEXT,
    verification_status_changed_by UUID REFERENCES auth.users(id),
    verification_status_changed_at TIMESTAMPTZ,
    docs_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS licenses_org_idx ON public.licenses(org_id);
CREATE INDEX IF NOT EXISTS licenses_user_idx ON public.licenses(user_id);
CREATE INDEX IF NOT EXISTS licenses_type_idx ON public.licenses(type);
CREATE INDEX IF NOT EXISTS licenses_status_idx ON public.licenses(status);
CREATE UNIQUE INDEX IF NOT EXISTS licenses_unique_agent ON public.licenses(user_id) WHERE type = 'agent';
CREATE UNIQUE INDEX IF NOT EXISTS licenses_unique_brokerage ON public.licenses(org_id) WHERE type = 'brokerage';

-- Invitation tokens must remain unique
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'org_invitations_token_key'
          AND conrelid = 'public.org_invitations'::regclass
    ) THEN
        ALTER TABLE public.org_invitations
            ADD CONSTRAINT org_invitations_token_key UNIQUE (token);
    END IF;
END
$$;

-- Permission policies per org
CREATE TABLE IF NOT EXISTS public.permission_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE NOT NULL,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT permission_policies_unique_key UNIQUE (org_id, key)
);

CREATE INDEX IF NOT EXISTS permission_policies_org_idx ON public.permission_policies(org_id);

-- Audit log for admin overrides and sensitive actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    actor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    org_id UUID REFERENCES public.orgs(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS audit_logs_org_idx ON public.audit_logs(org_id);
CREATE INDEX IF NOT EXISTS audit_logs_actor_idx ON public.audit_logs(actor_user_id);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs(action);

-- Feature flags with optional scoping
CREATE TABLE IF NOT EXISTS public.feature_flags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT NOT NULL,
    value JSONB NOT NULL,
    scope_type TEXT DEFAULT 'global',
    scope_id UUID,
    enabled BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT feature_flags_unique_scope UNIQUE (key, scope_type, scope_id)
);

CREATE INDEX IF NOT EXISTS feature_flags_scope_idx ON public.feature_flags(scope_type, scope_id);

-- Update dependent tables from firm_id -> org_id
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'listing_drafts'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'listing_drafts' AND column_name = 'firm_id'
        ) THEN
            EXECUTE 'ALTER TABLE public.listing_drafts RENAME COLUMN firm_id TO org_id';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'listing_drafts' AND indexname = 'listing_drafts_org_idx'
        ) THEN
            EXECUTE 'CREATE INDEX listing_drafts_org_idx ON public.listing_drafts(org_id)';
        END IF;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'properties'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'properties' AND column_name = 'firm_id'
        ) THEN
            EXECUTE 'ALTER TABLE public.properties RENAME COLUMN firm_id TO org_id';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'properties' AND indexname = 'properties_org_idx'
        ) THEN
            EXECUTE 'CREATE INDEX properties_org_idx ON public.properties(org_id)';
        END IF;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'property_events'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'property_events' AND column_name = 'firm_id'
        ) THEN
            EXECUTE 'ALTER TABLE public.property_events RENAME COLUMN firm_id TO org_id';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'property_events' AND indexname = 'property_events_org_idx'
        ) THEN
            EXECUTE 'CREATE INDEX property_events_org_idx ON public.property_events(org_id)';
        END IF;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'leads'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'leads' AND column_name = 'firm_id'
        ) THEN
            EXECUTE 'ALTER TABLE public.leads RENAME COLUMN firm_id TO org_id';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'leads' AND indexname = 'leads_org_idx'
        ) THEN
            EXECUTE 'CREATE INDEX leads_org_idx ON public.leads(org_id)';
        END IF;
    END IF;
END
$$;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'calendar_events'
    ) THEN
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'calendar_events' AND column_name = 'firm_id'
        ) THEN
            EXECUTE 'ALTER TABLE public.calendar_events RENAME COLUMN firm_id TO org_id';
        END IF;
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE schemaname = 'public' AND tablename = 'calendar_events' AND indexname = 'calendar_events_org_idx'
        ) THEN
            EXECUTE 'CREATE INDEX calendar_events_org_idx ON public.calendar_events(org_id)';
        END IF;
    END IF;
END
$$;

-- Refresh property lifecycle trigger to reflect org rename
DROP TRIGGER IF EXISTS property_state_events_trg ON public.properties;

CREATE OR REPLACE FUNCTION emit_property_state_events()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.draft_id IS NOT NULL THEN
            INSERT INTO public.property_events (property_id, org_id, draft_id, event_type, payload)
            VALUES (NEW.id, NEW.org_id, NEW.draft_id, 'draft.promoted_to_property',
                jsonb_build_object('state', NEW.state, 'status', NEW.status));
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.state IS DISTINCT FROM NEW.state THEN
            IF NEW.state = 'LIVE' THEN
                INSERT INTO public.property_events (property_id, org_id, draft_id, event_type, payload)
                VALUES (NEW.id, NEW.org_id, NEW.draft_id, 'property.published',
                    jsonb_build_object('previous_state', OLD.state, 'status', NEW.status, 'published_at', NEW.published_at));
            ELSIF OLD.state = 'LIVE' AND NEW.state = 'PROPERTY_PENDING' THEN
                INSERT INTO public.property_events (property_id, org_id, draft_id, event_type, payload)
                VALUES (NEW.id, NEW.org_id, NEW.draft_id, 'property.unpublished',
                    jsonb_build_object('previous_state', OLD.state, 'status', NEW.status));
            ELSIF NEW.state = 'SOLD' THEN
                INSERT INTO public.property_events (property_id, org_id, draft_id, event_type, payload)
                VALUES (NEW.id, NEW.org_id, NEW.draft_id, 'property.closed',
                    jsonb_build_object('previous_state', OLD.state, 'status', NEW.status, 'closed_at', NEW.closed_at));
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER property_state_events_trg
    AFTER INSERT OR UPDATE ON public.properties
    FOR EACH ROW
    EXECUTE FUNCTION emit_property_state_events();

-- Refresh RLS policies to align with org membership model
DROP POLICY IF EXISTS listing_drafts_broker_read ON public.listing_drafts;
DROP POLICY IF EXISTS listing_drafts_broker_mutate ON public.listing_drafts;
DROP POLICY IF EXISTS properties_broker_read ON public.properties;
DROP POLICY IF EXISTS properties_broker_modify ON public.properties;

CREATE POLICY listing_drafts_team_read ON public.listing_drafts
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = listing_drafts.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
        )
    );

CREATE POLICY listing_drafts_team_write ON public.listing_drafts
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = listing_drafts.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = listing_drafts.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT')
        )
    );

CREATE POLICY properties_team_read ON public.properties
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = public.properties.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY properties_team_write ON public.properties
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = public.properties.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = public.properties.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER', 'AGENT')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- Recreate broker properties view with org nomenclature
DROP VIEW IF EXISTS public.vw_broker_properties;

CREATE OR REPLACE VIEW public.vw_broker_properties AS
SELECT
    p.*
FROM public.properties p;

GRANT SELECT ON public.vw_broker_properties TO authenticated;

-- Recreate consumer properties view to ensure compatibility after org rename
DROP VIEW IF EXISTS public.vw_consumer_properties;

CREATE OR REPLACE VIEW public.vw_consumer_properties AS
SELECT
    p.id,
    p.slug,
    CASE
        WHEN p.state = 'LIVE' THEN COALESCE(NULLIF(lower(p.status), 'draft'), 'active')
        WHEN p.state = 'PROPERTY_PENDING' THEN 'pending'
        WHEN p.state = 'SOLD' THEN 'sold'
    END AS status,
    p.state,
    p.published_at,
    p.updated_at,
    p.address_line,
    p.street_number,
    p.street_name,
    p.street_suffix,
    p.city,
    p.state_code,
    p.zip_code,
    p.latitude,
    p.longitude,
    p.list_price,
    p.bedrooms_total,
    p.bathrooms_total,
    p.bathrooms_full,
    p.bathrooms_half,
    p.living_area_sq_ft,
    p.lot_size_sq_ft,
    p.lot_size_acres,
    p.year_built,
    p.property_type,
    p.property_sub_type,
    p.cover_photo_url,
    p.photos,
    p.public_remarks,
    o.name AS brokerage_name,
    o.phone AS brokerage_phone
FROM public.properties p
LEFT JOIN public.orgs o ON o.id = p.org_id
WHERE p.state IN ('LIVE', 'PROPERTY_PENDING', 'SOLD');

GRANT SELECT ON public.vw_consumer_properties TO authenticated;
GRANT SELECT ON public.vw_consumer_properties TO anon;

-- Ensure updated_at triggers exist
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_orgs_updated_at ON public.orgs;
CREATE TRIGGER update_orgs_updated_at
    BEFORE UPDATE ON public.orgs
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.org_members;
CREATE TRIGGER update_org_members_updated_at
    BEFORE UPDATE ON public.org_members
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_org_subscriptions_updated_at ON public.org_subscriptions;
CREATE TRIGGER update_org_subscriptions_updated_at
    BEFORE UPDATE ON public.org_subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_org_invitations_updated_at ON public.org_invitations;
CREATE TRIGGER update_org_invitations_updated_at
    BEFORE UPDATE ON public.org_invitations
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_licenses_updated_at ON public.licenses;
CREATE TRIGGER update_licenses_updated_at
    BEFORE UPDATE ON public.licenses
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_permission_policies_updated_at ON public.permission_policies;
CREATE TRIGGER update_permission_policies_updated_at
    BEFORE UPDATE ON public.permission_policies
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

DROP TRIGGER IF EXISTS update_feature_flags_updated_at ON public.feature_flags;
CREATE TRIGGER update_feature_flags_updated_at
    BEFORE UPDATE ON public.feature_flags
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Encryption helper functions for PII (license numbers)
DO $$
BEGIN
    PERFORM current_setting('app.license_encryption_key');
EXCEPTION WHEN others THEN
    PERFORM set_config('app.license_encryption_key', 'CHANGE_ME', false);
END
$$;

CREATE OR REPLACE FUNCTION public.encrypt_license_number(value TEXT)
RETURNS BYTEA AS $$
DECLARE
    secret TEXT := current_setting('app.license_encryption_key');
BEGIN
    IF value IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN pgp_sym_encrypt(value, secret, 'cipher-algo=aes256');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrypt_license_number(value BYTEA)
RETURNS TEXT AS $$
DECLARE
    secret TEXT := current_setting('app.license_encryption_key');
BEGIN
    IF value IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN pgp_sym_decrypt(value, secret);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

REVOKE EXECUTE ON FUNCTION public.decrypt_license_number(BYTEA) FROM PUBLIC;

-- Trigger to maintain license encryption metadata
CREATE OR REPLACE FUNCTION public.licenses_encrypt_pii()
RETURNS TRIGGER AS $$
DECLARE
    plain TEXT;
BEGIN
    plain := COALESCE(NEW.metadata ->> 'license_number_plain', NEW.metadata ->> 'license_number');
    IF plain IS NULL AND TG_OP = 'INSERT' THEN
        RAISE EXCEPTION 'license_number_plain required in metadata when creating license';
    END IF;

    IF plain IS NOT NULL THEN
        NEW.license_number_encrypted := public.encrypt_license_number(plain);
        NEW.license_number_last4 := RIGHT(plain, 4);
        NEW.license_number_hash := encode(digest(plain, 'sha256'), 'hex');
        NEW.metadata := jsonb_set(COALESCE(NEW.metadata, '{}'::jsonb), '{license_number_plain}', 'null'::jsonb, TRUE);
    END IF;

    NEW.updated_at := timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS licenses_encrypt_pii_trg ON public.licenses;
CREATE TRIGGER licenses_encrypt_pii_trg
    BEFORE INSERT OR UPDATE ON public.licenses
    FOR EACH ROW EXECUTE FUNCTION public.licenses_encrypt_pii();

-- Row level security policies
ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Org policies based on active membership
CREATE POLICY orgs_select_members ON public.orgs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_members om
            WHERE om.org_id = orgs.id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
        )
        OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY orgs_update_owner ON public.orgs
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1
            FROM public.org_members om
            WHERE om.org_id = orgs.id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1
            FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY orgs_insert_super_admin ON public.orgs
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- Org member policies
CREATE POLICY org_members_select ON public.org_members
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.org_members om2
            WHERE om2.org_id = org_members.org_id
              AND om2.user_id = auth.uid()
              AND om2.status = 'active'
              AND om2.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY org_members_manage ON public.org_members
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members om2
            WHERE om2.org_id = org_members.org_id
              AND om2.user_id = auth.uid()
              AND om2.status = 'active'
              AND om2.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY org_members_update ON public.org_members
    FOR UPDATE TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.org_members om2
            WHERE om2.org_id = org_members.org_id
              AND om2.user_id = auth.uid()
              AND om2.status = 'active'
              AND om2.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.org_members om2
            WHERE om2.org_id = org_members.org_id
              AND om2.user_id = auth.uid()
              AND om2.status = 'active'
              AND om2.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY org_members_delete ON public.org_members
    FOR DELETE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om2
            WHERE om2.org_id = org_members.org_id
              AND om2.user_id = auth.uid()
              AND om2.status = 'active'
              AND om2.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- Subscription policies
CREATE POLICY org_subscriptions_select ON public.org_subscriptions
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = org_subscriptions.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY org_subscriptions_manage ON public.org_subscriptions
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = org_subscriptions.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND (om.role = 'BROKER_OWNER' OR om.can_manage_billing)
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = org_subscriptions.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND (om.role = 'BROKER_OWNER' OR om.can_manage_billing)
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- Invitation policies
CREATE POLICY org_invitations_select ON public.org_invitations
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = org_invitations.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY org_invitations_manage ON public.org_invitations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = org_invitations.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = org_invitations.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- License policies
CREATE POLICY licenses_select ON public.licenses
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = licenses.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY licenses_manage_self ON public.licenses
    FOR INSERT TO authenticated
    WITH CHECK (
        (type = 'agent' AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = licenses.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

CREATE POLICY licenses_update ON public.licenses
    FOR UPDATE TO authenticated
    USING (
        (type = 'agent' AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = licenses.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        (type = 'agent' AND user_id = auth.uid())
        OR EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = licenses.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- Permission policies access
CREATE POLICY permission_policies_select ON public.permission_policies
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = permission_policies.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY permission_policies_manage ON public.permission_policies
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = permission_policies.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role = 'BROKER_OWNER'
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = permission_policies.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role = 'BROKER_OWNER'
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

-- Audit logs read by owners/managers/support
CREATE POLICY audit_logs_select ON public.audit_logs
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.org_members om
            WHERE om.org_id = audit_logs.org_id
              AND om.user_id = auth.uid()
              AND om.status = 'active'
              AND om.role IN ('BROKER_OWNER', 'BROKER_MANAGER')
        )
        OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role IN ('SUPER_ADMIN', 'SUPPORT_ADMIN')
        )
    );

CREATE POLICY audit_logs_insert ON public.audit_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

-- Feature flags accessible globally
CREATE POLICY feature_flags_select ON public.feature_flags
    FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY feature_flags_manage_super_admin ON public.feature_flags
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.global_role = 'SUPER_ADMIN'
        )
    );

COMMIT;
