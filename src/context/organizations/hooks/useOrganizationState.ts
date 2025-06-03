
import { useState, useCallback } from "react";
import { OrganizationWithRole } from "../types";

export const useOrganizationState = () => {
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const switchOrganization = useCallback((organizationId: string): boolean => {
    const org = organizations.find(o => o.id === organizationId);
    if (!org) {
      console.error("Organization not found in user's organizations");
      return false;
    }

    setCurrentOrganization(org);
    localStorage.setItem('currentOrganizationId', organizationId);
    
    return true;
  }, [organizations]);

  const setCurrentOrganizationSafe = useCallback((org: OrganizationWithRole | null) => {
    setCurrentOrganization(org);
    if (org) {
      localStorage.setItem('currentOrganizationId', org.id);
    } else {
      localStorage.removeItem('currentOrganizationId');
    }
  }, []);

  return {
    organizations,
    setOrganizations,
    currentOrganization,
    setCurrentOrganization: setCurrentOrganizationSafe,
    isLoadingOrganizations,
    setIsLoadingOrganizations,
    initialLoadComplete,
    setInitialLoadComplete,
    switchOrganization
  };
};
