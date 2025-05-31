
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface OrganizationsContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  isLoadingOrganizations: boolean;
  initialLoadComplete: boolean;
  switchOrganization: (organizationId: string) => Promise<boolean>;
  refreshOrganizations: () => Promise<void>;
}

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch organizations that the user is a member of
  const fetchOrganizations = async () => {
    if (!user?.id) {
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoadingOrganizations(false);
      setInitialLoadComplete(true);
      return;
    }

    try {
      setIsLoadingOrganizations(true);
      
      // Get organizations through membership
      const { data: memberships, error: membershipError } = await supabase
        .from('organization_members')
        .select(`
          organization_id,
          role,
          organizations:organization_id (
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

      if (membershipError) {
        console.error('Error fetching organization memberships:', membershipError);
        throw membershipError;
      }

      const userOrganizations: Organization[] = (memberships || [])
        .filter(membership => membership.organizations)
        .map(membership => ({
          id: membership.organizations.id,
          name: membership.organizations.name,
          slug: membership.organizations.slug,
          logoUrl: membership.organizations.logo_url,
          primaryColor: membership.organizations.primary_color,
          secondaryColor: membership.organizations.secondary_color,
          createdAt: new Date(membership.organizations.created_at),
          updatedAt: new Date(membership.organizations.updated_at),
        }));

      setOrganizations(userOrganizations);

      // Set current organization from localStorage or first available
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let selectedOrg = null;

      if (storedOrgId) {
        selectedOrg = userOrganizations.find(org => org.id === storedOrgId);
      }

      // If no stored org or stored org not found, use first available
      if (!selectedOrg && userOrganizations.length > 0) {
        selectedOrg = userOrganizations[0];
        localStorage.setItem('currentOrganizationId', selectedOrg.id);
      }

      setCurrentOrganization(selectedOrg);
      
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: "Error",
        description: "Failed to load organizations. Please try refreshing the page.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrganizations(false);
      setInitialLoadComplete(true);
    }
  };

  // Switch to a different organization
  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    try {
      const targetOrg = organizations.find(org => org.id === organizationId);
      
      if (!targetOrg) {
        console.error('Organization not found in user organizations:', organizationId);
        toast({
          title: "Error",
          description: "Organization not found or you don't have access to it.",
          variant: "destructive",
        });
        return false;
      }

      setCurrentOrganization(targetOrg);
      localStorage.setItem('currentOrganizationId', organizationId);
      
      toast({
        title: "Success",
        description: `Switched to ${targetOrg.name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: "Error", 
        description: "Failed to switch organization.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Refresh organizations
  const refreshOrganizations = async () => {
    await fetchOrganizations();
  };

  // Load organizations when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchOrganizations();
    } else {
      // User logged out, clear organization data
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoadingOrganizations(false);
      setInitialLoadComplete(true);
      localStorage.removeItem('currentOrganizationId');
    }
  }, [isAuthenticated, user?.id]);

  return (
    <OrganizationsContext.Provider
      value={{
        organizations,
        currentOrganization,
        isLoadingOrganizations,
        initialLoadComplete,
        switchOrganization,
        refreshOrganizations,
      }}
    >
      {children}
    </OrganizationsContext.Provider>
  );
};

export const useOrganizations = (): OrganizationsContextType => {
  const context = useContext(OrganizationsContext);
  if (context === undefined) {
    throw new Error("useOrganizations must be used within an OrganizationsProvider");
  }
  return context;
};
