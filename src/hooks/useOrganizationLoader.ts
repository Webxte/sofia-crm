
import React, { useState, useEffect } from "react";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Organization } from "@/types";

export const useOrganizationLoader = (slug: string | null) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOrganizationBySlug } = useOrganizations();
  
  useEffect(() => {
    let isMounted = true;
    const loadOrganization = async () => {
      if (!slug) {
        if (isMounted) {
          setError("No organization specified. Please use a URL with ?slug=yourorg");
          setIsLoaded(true);
        }
        return;
      }
      
      try {
        console.log("Loading organization with slug:", slug);
        const org = await getOrganizationBySlug(slug);
        
        if (!org) {
          throw new Error("Organization not found");
        }
        
        if (isMounted) {
          console.log("Organization loaded:", org);
          setOrganization(org);
          setIsLoaded(true);
        }
      } catch (err) {
        console.error("Error loading organization:", err);
        if (isMounted) {
          setError("Organization not found. Please check the URL and try again.");
          setIsLoaded(true);
        }
      }
    };
    
    loadOrganization();
    
    return () => {
      isMounted = false;
    };
  }, [slug, getOrganizationBySlug]);
  
  return {
    organization,
    isLoaded,
    error,
    setError
  };
};
