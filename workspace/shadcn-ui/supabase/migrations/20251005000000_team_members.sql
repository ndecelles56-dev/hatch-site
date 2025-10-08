-- Create team_members table to store broker team roster information

CREATE TABLE IF NOT EXISTS public.team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id text NOT NULL,
    org_id uuid REFERENCES public.orgs(id) ON DELETE CASCADE,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    role text NOT NULL DEFAULT 'Agent',
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    experience_years integer DEFAULT 0,
    rating numeric(4,2) DEFAULT 0,
    total_sales integer DEFAULT 0,
    deals_in_progress integer DEFAULT 0,
    open_leads integer DEFAULT 0,
    response_time_hours numeric(6,2) DEFAULT 0,
    joined_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    last_active_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    notes text,
    created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS team_members_tenant_id_idx ON public.team_members (tenant_id);
CREATE INDEX IF NOT EXISTS team_members_org_id_idx ON public.team_members (org_id);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Allow active org members to view team roster
CREATE POLICY IF NOT EXISTS "Team members select" ON public.team_members
  FOR SELECT
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.org_members om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
        AND (team_members.org_id IS NULL OR om.org_id = team_members.org_id)
    )
  );

-- Allow active org members to insert records for their org/tenant
CREATE POLICY IF NOT EXISTS "Team members insert" ON public.team_members
  FOR INSERT
  WITH CHECK (
    auth.role() = 'service_role'
    OR (
      auth.uid() IS NOT NULL
      AND EXISTS (
        SELECT 1
        FROM public.org_members om
        WHERE om.user_id = auth.uid()
          AND om.status = 'active'
          AND (team_members.org_id IS NULL OR om.org_id = team_members.org_id)
      )
    )
  );

-- Allow active org members to update roster entries for their org/tenant
CREATE POLICY IF NOT EXISTS "Team members update" ON public.team_members
  FOR UPDATE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.org_members om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
        AND (team_members.org_id IS NULL OR om.org_id = team_members.org_id)
    )
  )
  WITH CHECK (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.org_members om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
        AND (team_members.org_id IS NULL OR om.org_id = team_members.org_id)
    )
  );

-- Allow active org members to delete roster entries for their org/tenant
CREATE POLICY IF NOT EXISTS "Team members delete" ON public.team_members
  FOR DELETE
  USING (
    auth.role() = 'service_role'
    OR EXISTS (
      SELECT 1
      FROM public.org_members om
      WHERE om.user_id = auth.uid()
        AND om.status = 'active'
        AND (team_members.org_id IS NULL OR om.org_id = team_members.org_id)
    )
  );

-- Maintain updated_at timestamps
DROP TRIGGER IF EXISTS update_team_members_updated_at ON public.team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();
