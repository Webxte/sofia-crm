
-- Drop the problematic organization_members policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view their organization memberships" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can manage members" ON public.organization_members;

-- Create a security definer function to get user's organization memberships
CREATE OR REPLACE FUNCTION public.get_user_organization_memberships(user_uuid uuid)
RETURNS TABLE(organization_id uuid, role text)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT om.organization_id, om.role
  FROM public.organization_members om
  WHERE om.user_id = user_uuid;
$$;

-- Create a security definer function to check if user is organization owner
CREATE OR REPLACE FUNCTION public.is_organization_owner(user_uuid uuid, org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members om
    WHERE om.user_id = user_uuid 
    AND om.organization_id = org_id
    AND om.role = 'owner'
  );
$$;

-- Create new policies using the security definer functions
CREATE POLICY "Users can view their organization memberships" ON public.organization_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert memberships for organizations they own" ON public.organization_members
  FOR INSERT WITH CHECK (
    public.is_organization_owner(auth.uid(), organization_id)
  );

CREATE POLICY "Users can update memberships for organizations they own" ON public.organization_members
  FOR UPDATE USING (
    public.is_organization_owner(auth.uid(), organization_id)
  );

CREATE POLICY "Users can delete memberships for organizations they own" ON public.organization_members
  FOR DELETE USING (
    public.is_organization_owner(auth.uid(), organization_id)
  );
