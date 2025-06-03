
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { Organization } from "@/types";
import { OrganizationWithRole, OrganizationsContextType } from "./types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useOrganizationAuth } from "./hooks/useOrganizationAuth";
import { useOrganizationManagement } from "./hooks/useOrganizationManagement";
import { useOrganizationState } from "./hooks/useOrganizationState";
import { useOrganizationSetup } from "./hooks/useOrganizationSetup";
import { useOrganizationMembers } from "./hooks/useOrganizationMembers";

const OrganizationsContext = createContext<OrganizationsContextType | undefined>(undefined);

export const OrganizationsProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // State management
  const {
    organizations,
    setOrganizations,
    currentOrganization,
    setCurrentOrganization,
    isLoadingOrganizations,
    setIsLoadingOrganizations,
    initialLoadComplete,
    setInitialLoadComplete,
    switchOrganization: switchOrganizationState
  } = useOrganizationState();

  // Organization setup and data fetching
  const { getOrganizationBySlug, initializeUserOrganizations } = useOrganizationSetup(
    setOrganizations,
    setCurrentOrganization
  );

  // Member operations
  const { checkMembership, ensureOrganizationMembership } = useOrganizationMembers();

  // Auth and management hooks
  const { } = useOrganizationAuth();
  const { switchOrganization, createOrganization, updateOrganization } = useOrganizationManagement(
    organizations,
    setOrganizations,
    setCurrentOrganization
  );

  // Main fetch function
  const fetchOrganizations = async () => {
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, clearing organization data");
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoadingOrganizations(false);
      setInitialLoadComplete(true);
      return;
    }

    try {
      setIsLoadingOrganizations(true);
      console.log("Fetching organizations for user:", user.id);
      
      await initializeUserOrganizations(user.id);
      
    } catch (error) {
      console.error("Error fetching organizations:", error);
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
        checkMembership: (orgId: string) => checkMembership(orgId, user?.id || ''),
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
