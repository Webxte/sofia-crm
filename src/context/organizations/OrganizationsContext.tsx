
import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Organization } from "@/types";
import { OrganizationWithRole, OrganizationsContextType } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOrganizationAuth } from "./hooks/useOrganizationAuth";
import { useOrganizationManagement } from "./hooks/useOrganizationManagement";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Use extracted hooks
  const { getOrganizationBySlug, checkMembership, ensureOrganizationMembership } = useOrganizationAuth();
  const { switchOrganization, createOrganization, updateOrganization } = useOrganizationManagement(
    organizations, 
    setOrganizations, 
    setCurrentOrganization
  );

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
          role: (membership?.role || 'agent') as "owner" | "admin" | "agent"
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
            role: 'agent' as "owner" | "admin" | "agent"
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
