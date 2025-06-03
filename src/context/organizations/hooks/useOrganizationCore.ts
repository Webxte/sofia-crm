
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import { OrganizationWithRole } from "../types";
import { useToast } from "@/hooks/use-toast";

export interface OrganizationCoreProps {
  organizations: OrganizationWithRole[];
  setOrganizations: React.Dispatch<React.SetStateAction<OrganizationWithRole[]>>;
  currentOrganization: OrganizationWithRole | null;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<OrganizationWithRole | null>>;
  setMembers: React.Dispatch<React.SetStateAction<any[]>>;
  setInvites: React.Dispatch<React.SetStateAction<any[]>>;
  user: any;
  toast: any;
}

export const useUpdateOrganizationState = (props: OrganizationCoreProps) => {
  const { setOrganizations, setCurrentOrganization } = props;
  
  const updateOrganizationInState = useCallback((id: string, data: Partial<Organization>) => {
    setOrganizations(prev => 
      prev.map(org => org.id === id ? { ...org, ...data } : org)
    );
    setCurrentOrganization(prev => 
      prev?.id === id ? { ...prev, ...data } : prev
    );
  }, [setOrganizations, setCurrentOrganization]);

  const removeOrganizationFromState = useCallback((id: string) => {
    setOrganizations(prev => prev.filter(org => org.id !== id));
  }, [setOrganizations]);

  return {
    updateOrganizationInState,
    removeOrganizationFromState
  };
};

export const useOrganizationCore = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const fetchOrganizations = useCallback(async () => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, clearing organization data");
      setOrganizations([]);
      setCurrentOrganization(null);
      setInitialLoadComplete(true);
      return;
    }

    try {
      setIsLoadingOrganizations(true);
      console.log("Fetching organizations for user:", user.id);
      
      // Use the security definer function to get memberships
      const { data: memberships, error } = await supabase.rpc(
        'get_user_organization_memberships',
        { user_uuid: user.id }
      );

      if (error) {
        console.error("Error fetching organization memberships:", error);
        throw error;
      }

      console.log("Raw organization memberships:", memberships);

      if (!memberships || memberships.length === 0) {
        console.log("User has no organizations, attempting to add to belmorso");
        await addUserToBelmorso();
        return;
      }

      // Get organization details
      const orgIds = memberships.map((m: any) => m.organization_id);
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) throw orgsError;

      const orgs: OrganizationWithRole[] = orgsData.map(org => {
        const membership = memberships.find((m: any) => m.organization_id === org.id);
        return {
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logo_url,
          primaryColor: org.primary_color,
          secondaryColor: org.secondary_color,
          createdAt: new Date(org.created_at),
          updatedAt: new Date(org.updated_at),
          role: membership?.role as "owner" | "admin" | "agent"
        };
      });

      console.log("Formatted organizations:", orgs);
      setOrganizations(orgs);

    } catch (error) {
      console.error("Error in fetchOrganizations:", error);
      toast({
        title: "Error",
        description: "Failed to load organizations",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrganizations(false);
      setInitialLoadComplete(true);
    }
  }, [isAuthenticated, user, toast]);

  const addUserToBelmorso = async () => {
    if (!user) return;

    try {
      console.log("Adding user to belmorso organization");
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'belmorso')
        .single();

      if (orgError || !orgData) {
        console.error("Belmorso organization not found:", orgError);
        return;
      }

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          user_id: user.id,
          organization_id: orgData.id,
          role: 'agent'
        });

      if (memberError) {
        console.error("Error adding user to organization:", memberError);
        return;
      }

      console.log("Successfully added user to belmorso organization");
      await fetchOrganizations();
      
    } catch (error) {
      console.error("Error in addUserToBelmorso:", error);
    }
  };

  const getOrganizationBySlug = useCallback(async (slug: string): Promise<Organization | null> => {
    console.log("Getting organization by slug:", slug);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error("Error fetching organization by slug:", error);
        return null;
      }

      if (!data) {
        console.log("No organization found with slug:", slug);
        return null;
      }

      console.log("Found organization:", data.name);
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in getOrganizationBySlug:", error);
      return null;
    }
  }, []);

  const checkMembership = useCallback(async (organizationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc(
        'is_member_of_organization',
        {
          _user_id: user.id,
          _organization_id: organizationId
        }
      );

      if (error) {
        console.error("Error checking membership:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking membership:", error);
      return false;
    }
  }, [user]);

  const switchOrganization = useCallback(async (organizationId: string): Promise<boolean> => {
    const org = organizations.find(o => o.id === organizationId);
    if (!org) {
      console.error("Organization not found in user's organizations");
      return false;
    }

    setCurrentOrganization(org);
    localStorage.setItem('currentOrganizationId', organizationId);
    
    return true;
  }, [organizations]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  useEffect(() => {
    if (organizations.length > 0 && !currentOrganization) {
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let orgToSet: OrganizationWithRole | null = null;

      if (storedOrgId) {
        orgToSet = organizations.find(org => org.id === storedOrgId) || null;
      }
      
      if (!orgToSet) {
        orgToSet = organizations[0];
      }

      if (orgToSet) {
        setCurrentOrganization(orgToSet);
        localStorage.setItem('currentOrganizationId', orgToSet.id);
      }
    }
  }, [organizations, currentOrganization]);

  return {
    organizations,
    currentOrganization,
    isLoadingOrganizations,
    initialLoadComplete,
    fetchOrganizations,
    getOrganizationBySlug,
    checkMembership,
    switchOrganization,
    setCurrentOrganization
  };
};
