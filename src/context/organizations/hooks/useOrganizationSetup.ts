
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizationData } from "./useOrganizationData";
import { useOrganizationMembers } from "./useOrganizationMembers";
import { OrganizationWithRole } from "../types";

export const useOrganizationSetup = (
  setOrganizations: React.Dispatch<React.SetStateAction<OrganizationWithRole[]>>,
  setCurrentOrganization: (org: OrganizationWithRole | null) => void
) => {
  const { getOrganizationBySlug, fetchUserOrganizations } = useOrganizationData();
  const { ensureOrganizationMembership } = useOrganizationMembers();

  const addUserToBelmorso = useCallback(async (userId: string) => {
    try {
      console.log("useOrganizationSetup: Adding user to belmorso organization");
      
      let belmorsoOrg = await getOrganizationBySlug('belmorso');
      
      if (!belmorsoOrg) {
        console.log("useOrganizationSetup: Belmorso organization not found, creating it");
        
        const { data: createdOrg, error: createError } = await supabase
          .from('organizations')
          .insert({
            name: 'Belmorso',
            slug: 'belmorso',
          })
          .select()
          .single();
        
        if (createError) {
          console.error("useOrganizationSetup: Error creating Belmorso organization:", createError);
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

      if (belmorsoOrg) {
        console.log("useOrganizationSetup: Ensuring membership for belmorso");
        const membershipSuccess = await ensureOrganizationMembership(belmorsoOrg.id, userId);
        
        if (membershipSuccess) {
          const belmorsoWithRole: OrganizationWithRole = {
            ...belmorsoOrg,
            role: 'member' as const
          };
          
          console.log("useOrganizationSetup: Setting belmorso as organizations and current org");
          setOrganizations([belmorsoWithRole]);
          setCurrentOrganization(belmorsoWithRole);
          
          // Store in localStorage for persistence
          localStorage.setItem('currentOrganizationId', belmorsoOrg.id);
        }
      }
    } catch (error) {
      console.error("useOrganizationSetup: Error in addUserToBelmorso:", error);
    }
  }, [getOrganizationBySlug, ensureOrganizationMembership, setOrganizations, setCurrentOrganization]);

  const initializeUserOrganizations = useCallback(async (userId: string) => {
    try {
      console.log("useOrganizationSetup: Initializing organizations for user:", userId);
      
      const userOrgs = await fetchUserOrganizations(userId);
      console.log("useOrganizationSetup: Found user organizations:", userOrgs.length);
      
      if (userOrgs.length === 0) {
        console.log("useOrganizationSetup: User has no organizations, attempting to add to belmorso");
        await addUserToBelmorso(userId);
        return;
      }

      setOrganizations(userOrgs);

      // Set current organization from localStorage or first available
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let orgToSet: OrganizationWithRole | null = null;

      if (storedOrgId) {
        orgToSet = userOrgs.find(org => org.id === storedOrgId) || null;
        console.log("useOrganizationSetup: Found stored organization:", orgToSet?.name);
      }
      
      if (!orgToSet && userOrgs.length > 0) {
        orgToSet = userOrgs[0];
        console.log("useOrganizationSetup: Using first available organization:", orgToSet.name);
      }

      if (orgToSet) {
        setCurrentOrganization(orgToSet);
        localStorage.setItem('currentOrganizationId', orgToSet.id);
        console.log("useOrganizationSetup: Set current organization:", orgToSet.name);
      }
    } catch (error) {
      console.error("useOrganizationSetup: Error in initializeUserOrganizations:", error);
    }
  }, [fetchUserOrganizations, addUserToBelmorso, setOrganizations, setCurrentOrganization]);

  return {
    getOrganizationBySlug,
    initializeUserOrganizations
  };
};
