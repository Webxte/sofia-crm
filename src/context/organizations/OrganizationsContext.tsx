
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Organization, OrganizationMember } from "@/types";
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
  createOrganization: (name: string, slug: string) => Promise<Organization | null>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<boolean>;
  getOrganizationBySlug: (slug: string) => Promise<Organization | null>;
  fetchOrganizations: () => Promise<void>;
  canUserPerformAction: (action: "delete" | "update" | "invite") => boolean;
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

  // Create a new organization
  const createOrganization = async (name: string, slug: string): Promise<Organization | null> => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to create an organization.",
        variant: "destructive",
      });
      return null;
    }

    try {
      // First create the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name,
          slug,
        }])
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        toast({
          title: "Error",
          description: "Failed to create organization. The slug may already be taken.",
          variant: "destructive",
        });
        return null;
      }

      // Then add the user as an admin member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgData.id,
          user_id: user.id,
          role: 'admin'
        }]);

      if (memberError) {
        console.error('Error adding user to organization:', memberError);
        // Try to clean up the organization if member creation failed
        await supabase.from('organizations').delete().eq('id', orgData.id);
        toast({
          title: "Error",
          description: "Failed to set up organization membership.",
          variant: "destructive",
        });
        return null;
      }

      const newOrg: Organization = {
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        logoUrl: orgData.logo_url,
        primaryColor: orgData.primary_color,
        secondaryColor: orgData.secondary_color,
        createdAt: new Date(orgData.created_at),
        updatedAt: new Date(orgData.updated_at),
      };

      // Update local state
      setOrganizations(prev => [...prev, newOrg]);
      setCurrentOrganization(newOrg);
      localStorage.setItem('currentOrganizationId', newOrg.id);

      toast({
        title: "Success",
        description: `Organization "${name}" created successfully!`,
      });

      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the organization.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Update organization
  const updateOrganization = async (id: string, data: Partial<Organization>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating organization:', error);
        toast({
          title: "Error",
          description: "Failed to update organization.",
          variant: "destructive",
        });
        return false;
      }

      // Update local state
      setOrganizations(prev => 
        prev.map(org => org.id === id ? { ...org, ...data } : org)
      );

      if (currentOrganization?.id === id) {
        setCurrentOrganization(prev => prev ? { ...prev, ...data } : null);
      }

      toast({
        title: "Success",
        description: "Organization updated successfully!",
      });

      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while updating the organization.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Get organization by slug
  const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        console.error('Error fetching organization by slug:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('Error fetching organization by slug:', error);
      return null;
    }
  };

  // Check if user can perform action (simplified for now)
  const canUserPerformAction = (action: "delete" | "update" | "invite"): boolean => {
    // For now, assume all authenticated users can perform actions
    // This would typically check the user's role in the organization
    return !!user;
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
        createOrganization,
        updateOrganization,
        getOrganizationBySlug,
        fetchOrganizations,
        canUserPerformAction,
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
