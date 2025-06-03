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
          return null; // Not found
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

  // Check if user is a member of organization
  const checkMembership = async (organizationId: string): Promise<boolean> => {
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
  };

  // Ensure user is a member of organization
  const ensureOrganizationMembership = async (orgId: string, userId: string): Promise<boolean> => {
    try {
      // Check if user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .maybeSingle();

      if (membershipError) {
        console.error("Error checking membership:", membershipError);
        return false;
      }

      if (existingMembership) {
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

  // Fetch organizations and ensure user membership
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

      // Try to get the default Belmorso organization
      let belmorsoOrg = await getOrganizationBySlug('belmorso');
      
      if (!belmorsoOrg) {
        console.log("Belmorso organization not found, creating it");
        
        // Create the Belmorso organization if it doesn't exist
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
        } else {
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
          console.log("Created Belmorso organization:", belmorsoOrg);
        }
      }

      if (belmorsoOrg) {
        // Ensure user is a member of the Belmorso organization
        const membershipSuccess = await ensureOrganizationMembership(belmorsoOrg.id, user.id);
        
        if (membershipSuccess) {
          // If successful, set Belmorso as the current organization
          setOrganizations([belmorsoOrg]);
          setCurrentOrganization(belmorsoOrg);
          localStorage.setItem('currentOrganizationId', belmorsoOrg.id);
          console.log("Set Belmorso as current organization");
          setIsLoadingOrganizations(false);
          setInitialLoadComplete(true);
          return;
        }
      }

      // Fallback: try to get organizations through membership
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
      }

      console.log("Raw memberships data:", memberships);

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

      console.log("Formatted user organizations:", userOrganizations);
      setOrganizations(userOrganizations);

      // Set current organization from localStorage or first available
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let selectedOrg = null;

      if (storedOrgId) {
        selectedOrg = userOrganizations.find(org => org.id === storedOrgId);
        console.log("Found stored organization:", selectedOrg?.name || "none");
      }

      // If no stored org or stored org not found, use first available
      if (!selectedOrg && userOrganizations.length > 0) {
        selectedOrg = userOrganizations[0];
        localStorage.setItem('currentOrganizationId', selectedOrg.id);
        console.log("Using first available organization:", selectedOrg.name);
      }

      if (selectedOrg) {
        console.log("Setting current organization to:", selectedOrg.name);
      } else {
        console.log("No organization to set as current");
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
      console.log("Attempting to switch to organization ID:", organizationId);
      
      // First, try to find in current organizations list
      let targetOrg = organizations.find(org => org.id === organizationId);
      
      // If not found, try to fetch from database
      if (!targetOrg) {
        console.log("Organization not in current list, fetching from database");
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();
          
        if (error) {
          console.error("Error fetching organization:", error);
          toast({
            title: "Error",
            description: "Organization not found or you don't have access to it.",
            variant: "destructive",
          });
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
        };
        
        // Add to organizations list if not already there
        setOrganizations(prev => {
          const exists = prev.find(org => org.id === organizationId);
          return exists ? prev : [...prev, targetOrg!];
        });

        // Ensure user is a member
        if (user?.id) {
          await ensureOrganizationMembership(targetOrg.id, user.id);
        }
      }

      console.log("Switching to organization:", targetOrg.name);
      setCurrentOrganization(targetOrg);
      localStorage.setItem('currentOrganizationId', organizationId);
      
      console.log("Organization switch completed successfully");
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
      console.log("Creating new organization:", name, slug);
      
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

      console.log("Organization created:", orgData);

      // Then add the user as an admin member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgData.id,
          user_id: user.id,
          role: 'owner'
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

      console.log("User added to organization as owner");

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
      console.log("User authenticated, fetching organizations");
      fetchOrganizations();
    } else {
      // User logged out, clear organization data
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
        members: [], // TODO: Implement members fetching
        invites: [], // TODO: Implement invites fetching
        loading: false,
        isLoadingOrganizations,
        initialLoadComplete,
        createOrganization,
        updateOrganization,
        deleteOrganization: async () => false, // TODO: Implement
        switchOrganization,
        inviteMember: async () => false, // TODO: Implement
        removeMember: async () => false, // TODO: Implement
        updateMemberRole: async () => false, // TODO: Implement
        getUserRole: () => null, // TODO: Implement
        canUserPerformAction,
        organization: currentOrganization,
        getOrganizationBySlug,
        getOrganizationMembers: async () => {}, // TODO: Implement
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
