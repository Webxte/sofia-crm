
-- Fix is_user_admin and get_current_user_role to ensure search_path is set
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT COALESCE(role, 'agent') FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT public.get_current_user_role() = 'admin';
$$;

-- Fix analytics_events INSERT policy to validate user_id matches auth.uid()
DROP POLICY IF EXISTS "Any authenticated user can insert analytics events" ON public.analytics_events;
CREATE POLICY "Any authenticated user can insert analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));

-- Drop dead organization functions since the table doesn't exist
DROP FUNCTION IF EXISTS public.get_user_organization_memberships(uuid);
DROP FUNCTION IF EXISTS public.is_organization_owner(uuid, uuid);
