-- Ensure hosted schema has updated_at on profiles for trigger compatibility
ALTER TABLE public.profiles
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc', now());

-- Ensure org_members has created_at/updated_at timestamps if missing (safety net)
ALTER TABLE public.org_members
    ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT timezone('utc', now()),
    ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT timezone('utc', now());
