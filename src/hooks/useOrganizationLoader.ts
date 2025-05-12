
import React, { useState, useEffect } from "react";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";

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
        
        // First try using the context method
        let org = await getOrganizationBySlug(slug);
        
        // If that fails, try direct database query as fallback
        if (!org) {
          console.log("Fallback: Querying database directly for organization");
          const { data, error: dbError } = await supabase
            .from('organizations')
            .select('*')
            .eq('slug', slug)
            .single();
          
          if (dbError) {
            console.error("Database error fetching organization:", dbError);
            throw new Error(dbError.message);
          }
          
          if (data) {
            org = {
              id: data.id,
              name: data.name,
              slug: data.slug,
              logoUrl: data.logo_url || undefined,
              primaryColor: data.primary_color || undefined,
              secondaryColor: data.secondary_color || undefined,
              createdAt: new Date(data.created_at),
              updatedAt: new Date(data.updated_at)
            };
            console.log("Found organization via direct query:", org.name);
          }
        }
        
        if (!org) {
          console.error(`Organization with slug "${slug}" not found`);
          throw new Error(`Organization "${slug}" not found`);
        }
        
        if (isMounted) {
          console.log("Organization loaded:", org);
          setOrganization(org);
          setIsLoaded(true);
          setError(null); // Clear any previous errors
        }
      } catch (err: any) {
        console.error("Error loading organization:", err);
        if (isMounted) {
          setError(err.message || "Organization not found. Please check the URL and try again.");
          setOrganization(null);
          setIsLoaded(true);
        }
      }
    };
    
    setIsLoaded(false); // Reset loaded state at the start
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
