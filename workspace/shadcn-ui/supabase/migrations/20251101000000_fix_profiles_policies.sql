-- Fix recursive RLS policies on profiles by routing admin checks through a security definer helper

CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.user_is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_is_admin() TO service_role;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (public.user_is_admin());

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE
  USING (public.user_is_admin())
  WITH CHECK (public.user_is_admin());
