
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Organization, OrganizationMember } from "@/types";
import { OrganizationWithRole, OrganizationsContextType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Get organization by slug - including direct database lookup
  const getOrganizationBySlug = async (slug: string): Promise<Organization | null> => {
    try {
      console.log("Getting organization by slug:", slug);
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log("Organization not found with slug:", slug);
          return null;
        }
        console.error('Error fetching organization by slug:', error);
        return null;
      }

      const org: Organization = {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      console.log("Found organization:", org.name);
      return org;
    } catch (error) {
      console.error('Error fetching organization by slug:', error);
      return null;
    }
  };

  // Check if user is a member of organization using security definer function
  const checkMembership = async (organizationId: string): Promise<boolean> => {
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
  };

  // Ensure user is a member of organization
  const ensureOrganizationMembership = async (orgId: string, userId: string): Promise<boolean> => {
    try {
      // Use RPC function to check membership to avoid RLS issues
      const isMember = await checkMembership(orgId);
      
      if (isMember) {
        console.log("User is already a member of organization:", orgId);
        return true;
      }

      // If not a member, add them
      console.log("Adding user to organization:", orgId);
      const { error: addError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: orgId,
          user_id: userId,
          role: 'agent'
        });

      if (addError) {
        console.error("Error adding user to organization:", addError);
        return false;
      }

      console.log("Successfully added user to organization:", orgId);
      return true;
    } catch (error) {
      console.error("Error in ensureOrganizationMembership:", error);
      return false;
    }
  };

  // Fetch organizations using the user's organization memberships
  const fetchOrganizations = async () => {
    if (!user?.id) {
      console.log("No user ID, clearing organization data");
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoadingOrganizations(false);
      setInitialLoadComplete(true);
      return;
    }

    try {
      setIsLoadingOrganizations(true);
      console.log("Fetching organizations for user:", user.id);

      // Get user's organization memberships using security definer function
      const { data: memberships, error: membershipError } = await supabase.rpc(
        'get_user_organization_memberships',
        { user_uuid: user.id }
      );

      if (membershipError) {
        console.error('Error fetching organization memberships:', membershipError);
        // Fallback: try to get/create belmorso organization
        await handleBelmorsoFallback();
        return;
      }

      if (!memberships || memberships.length === 0) {
        console.log("User has no organization memberships, setting up belmorso");
        await handleBelmorsoFallback();
        return;
      }

      // Get organizations details
      const orgIds = memberships.map((m: any) => m.organization_id);
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) {
        console.error('Error fetching organizations:', orgsError);
        throw orgsError;
      }

      // Format organizations with roles
      const userOrganizations: OrganizationWithRole[] = orgsData.map(org => {
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
          role: membership?.role || 'agent'
        };
      });

      console.log("Formatted user organizations:", userOrganizations);
      setOrganizations(userOrganizations);

      // Set current organization
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let selectedOrg = null;

      if (storedOrgId) {
        selectedOrg = userOrganizations.find(org => org.id === storedOrgId);
      }

      if (!selectedOrg && userOrganizations.length > 0) {
        selectedOrg = userOrganizations[0];
        if (selectedOrg) {
          localStorage.setItem('currentOrganizationId', selectedOrg.id);
        }
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

  // Handle belmorso fallback
  const handleBelmorsoFallback = async () => {
    try {
      let belmorsoOrg = await getOrganizationBySlug('belmorso');
      
      if (!belmorsoOrg) {
        console.log("Belmorso organization not found, creating it");
        
        const { data: createdOrg, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: 'Belmorso',
            slug: 'belmorso',
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating Belmorso organization:", createError);
          setOrganizations([]);
          setCurrentOrganization(null);
          return;
        }

        belmorsoOrg = {
          id: createdOrg.id,
          name: createdOrg.name,
          slug: createdOrg.slug,
          logoUrl: createdOrg.logo_url,
          primaryColor: createdOrg.primary_color,
          secondaryColor: createdOrg.secondary_color,
          createdAt: new Date(createdOrg.created_at),
          updatedAt: new Date(createdOrg.updated_at),
        };
      }

      if (belmorsoOrg && user?.id) {
        const membershipSuccess = await ensureOrganizationMembership(belmorsoOrg.id, user.id);
        
        if (membershipSuccess) {
          const belmorsoWithRole: OrganizationWithRole = {
            ...belmorsoOrg,
            role: 'agent'
          };
          
          setOrganizations([belmorsoWithRole]);
          setCurrentOrganization(belmorsoWithRole);
          localStorage.setItem('currentOrganizationId', belmorsoOrg.id);
          console.log("Set Belmorso as current organization");
        }
      }
    } catch (error) {
      console.error("Error in handleBelmorsoFallback:", error);
      setOrganizations([]);
      setCurrentOrganization(null);
    }
  };

  // Switch to a different organization
  const switchOrganization = async (organizationId: string): Promise<boolean> => {
    try {
      console.log("Attempting to switch to organization ID:", organizationId);
      
      let targetOrg = organizations.find(org => org.id === organizationId);
      
      if (!targetOrg) {
        console.log("Organization not in current list, fetching from database");
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();
          
        if (error) {
          console.error("Error fetching organization:", error);
          return false;
        }
        
        targetOrg = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          logoUrl: orgData.logo_url,
          primaryColor: orgData.primary_color,
          secondaryColor: orgData.secondary_color,
          createdAt: new Date(orgData.created_at),
          updatedAt: new Date(orgData.updated_at),
          role: 'agent'
        };
        
        setOrganizations(prev => {
          const exists = prev.find(org => org.id === organizationId);
          return exists ? prev : [...prev, targetOrg!];
        });

        if (user?.id) {
          await ensureOrganizationMembership(targetOrg.id, user.id);
        }
      }

      console.log("Switching to organization:", targetOrg.name);
      setCurrentOrganization(targetOrg);
      localStorage.setItem('currentOrganizationId', organizationId);
      
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    }
  };

  // Create a new organization
  const createOrganization = async (name: string, slug: string): Promise<Organization | null> => {
    if (!user?.id) {
      return null;
    }

    try {
      console.log("Creating new organization:", name, slug);
      
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
        return null;
      }

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgData.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) {
        console.error('Error adding user to organization:', memberError);
        await supabase.from('organizations').delete().eq('id', orgData.id);
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

      const newOrgWithRole: OrganizationWithRole = { ...newOrg, role: 'owner' };
      setOrganizations(prev => [...prev, newOrgWithRole]);
      setCurrentOrganization(newOrgWithRole);
      localStorage.setItem('currentOrganizationId', newOrg.id);

      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
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
        return false;
      }

      setOrganizations(prev => 
        prev.map(org => org.id === id ? { ...org, ...data } : org)
      );

      if (currentOrganization?.id === id) {
        setCurrentOrganization(prev => prev ? { ...prev, ...data } : null);
      }

      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      return false;
    }
  };

  // Load organizations when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log("User authenticated, fetching organizations");
      fetchOrganizations();
    } else {
      console.log("User not authenticated, clearing organization data");
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
        members: [],
        invites: [],
        loading: false,
        isLoadingOrganizations,
        initialLoadComplete,
        createOrganization,
        updateOrganization,
        deleteOrganization: async () => false,
        switchOrganization,
        inviteMember: async () => false,
        removeMember: async () => false,
        updateMemberRole: async () => false,
        getUserRole: () => currentOrganization?.role || null,
        canUserPerformAction: () => !!user,
        organization: currentOrganization,
        getOrganizationBySlug,
        getOrganizationMembers: async () => {},
        fetchOrganizations,
        checkMembership,
        setCurrentOrganization,
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
