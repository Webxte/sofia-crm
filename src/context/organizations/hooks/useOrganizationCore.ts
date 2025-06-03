import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import { useToast } from "@/hooks/use-toast";

export interface OrganizationCoreProps {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  currentOrganization: Organization | null;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
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
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
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
      console.log("User authenticated, fetching organizations");
      console.log("Fetching organizations for user:", user.id);
      
      const { data, error } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations:organization_id(
            id,
            name,
            slug,
            logo_url,
            primary_color,
            secondary_color,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error("Error fetching organizations:", error);
        throw error;
      }

      console.log("Raw organization memberships:", data);

      const orgs: Organization[] = (data || [])
        .filter(item => item.organizations)
        .map(item => ({
          id: item.organizations!.id,
          name: item.organizations!.name,
          slug: item.organizations!.slug,
          logoUrl: item.organizations!.logo_url,
          primaryColor: item.organizations!.primary_color,
          secondaryColor: item.organizations!.secondary_color,
          createdAt: new Date(item.organizations!.created_at),
          updatedAt: new Date(item.organizations!.updated_at),
          role: item.role as "owner" | "admin" | "agent"
        }));

      console.log("Formatted organizations:", orgs);
      setOrganizations(orgs);

      // If user has no organizations but is trying to access belmorso, add them automatically
      if (orgs.length === 0) {
        console.log("User has no organizations, attempting to add to belmorso");
        await addUserToBelmorso();
      }

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
      
      // First, get the belmorso organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', 'belmorso')
        .single();

      if (orgError || !orgData) {
        console.error("Belmorso organization not found:", orgError);
        return;
      }

      // Add user to the organization
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
      
      // Refresh organizations after adding
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
        updatedAt: new Date(data.updated_at),
        role: "agent" // Default role when getting by slug
      };
    } catch (error) {
      console.error("Error in getOrganizationBySlug:", error);
      return null;
    }
  }, []);

  const checkMembership = useCallback(async (organizationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('user_id', user.id)
        .single();

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
    
    // Store in localStorage for persistence
    localStorage.setItem('currentOrganizationId', organizationId);
    
    return true;
  }, [organizations]);

  // Initialize organizations when user auth state changes
  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  // Set current organization from localStorage or default to first org
  useEffect(() => {
    if (organizations.length > 0 && !currentOrganization) {
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let orgToSet: Organization | null = null;

      if (storedOrgId) {
        orgToSet = organizations.find(org => org.id === storedOrgId) || null;
      }
      
      // If no stored org or stored org not found, default to first organization
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
