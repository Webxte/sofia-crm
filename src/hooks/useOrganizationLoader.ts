
import { useState, useEffect, useRef } from "react";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

// Default organization if none is provided
const DEFAULT_ORG_SLUG = "belmorso";

export const useOrganizationLoader = (slug: string | null) => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const { getOrganizationBySlug } = useOrganizations();
  const isMounted = useRef(true);
  const fetchInProgress = useRef(false);
  
  useEffect(() => {
    // Set up cleanup function
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  useEffect(() => {
    let retryTimeout: NodeJS.Timeout;
    
    const loadOrganization = async () => {
      // Prevent concurrent fetches
      if (fetchInProgress.current) return;
      fetchInProgress.current = true;
      
      // Use default slug if none provided
      const orgSlug = slug || DEFAULT_ORG_SLUG;
      
      if (!orgSlug) {
        if (isMounted.current) {
          setError("No organization specified. Using default organization.");
          setIsLoaded(true);
        }
        fetchInProgress.current = false;
        return;
      }
      
      try {
        console.log(`Loading organization with slug: ${orgSlug}`);
        
        // First try using the context method
        let org = await getOrganizationBySlug(orgSlug);
        
        // If that fails, try direct database query as fallback
        if (!org) {
          console.log("Fallback: Querying database directly for organization");
          try {
            const { data, error: dbError } = await supabase
              .from('organizations')
              .select('*')
              .eq('slug', orgSlug)
              .maybeSingle();
            
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
          } catch (dbQueryError) {
            console.error("Error in direct query fallback:", dbQueryError);
          }
        }
        
        // Try localStorage as another fallback
        if (!org && loadAttempt < 2) {
          // If still no org found, retry with exponential backoff
          const retryDelay = Math.min(1000 * (2 ** loadAttempt), 5000);
          console.log(`No organization found, retrying in ${retryDelay}ms (attempt ${loadAttempt + 1})`);
          
          if (isMounted.current) {
            retryTimeout = setTimeout(() => {
              setLoadAttempt(prev => prev + 1);
            }, retryDelay);
            fetchInProgress.current = false;
            return;
          }
        }
        
        // Hard-code fallback for Belmorso specifically
        if (!org && orgSlug === 'belmorso') {
          // If we specifically asked for Belmorso but couldn't find it, create a mock object
          // This is a last resort fallback just for the demo app
          console.log("Creating mock Belmorso organization as last resort");
          org = {
            id: "belmorso-fallback-id",
            name: "Belmorso",
            slug: "belmorso",
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
        
        if (!org) {
          console.error(`Organization with slug "${orgSlug}" not found after all attempts`);
          throw new Error(`Organization "${orgSlug}" not found`);
        }
        
        if (isMounted.current) {
          console.log("Organization loaded:", org);
          setOrganization(org);
          setIsLoaded(true);
          setError(null); // Clear any previous errors
        }
      } catch (err: any) {
        console.error("Error loading organization:", err);
        if (isMounted.current) {
          setError(err.message || "Organization not found. Please check the URL and try again.");
          setOrganization(null);
          setIsLoaded(true);
        }
      }
      
      fetchInProgress.current = false;
    };
    
    setIsLoaded(false); // Reset loaded state at the start
    loadOrganization();
    
    return () => {
      if (retryTimeout) clearTimeout(retryTimeout);
    };
  }, [slug, getOrganizationBySlug, loadAttempt]);
  
  return {
    organization,
    isLoaded,
    error,
    setError
  };
};
