
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
      console.log("Adding user to belmorso organization");
      
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
        const membershipSuccess = await ensureOrganizationMembership(belmorsoOrg.id, userId);
        
        if (membershipSuccess) {
          const belmorsoWithRole: OrganizationWithRole = {
            ...belmorsoOrg,
            role: 'member' as "owner" | "admin" | "member" | "manager" | "guest"
          };
          
          setOrganizations([belmorsoWithRole]);
          setCurrentOrganization(belmorsoWithRole);
          console.log("Set Belmorso as current organization");
        }
      }
    } catch (error) {
      console.error("Error in addUserToBelmorso:", error);
    }
  }, [getOrganizationBySlug, ensureOrganizationMembership, setOrganizations, setCurrentOrganization]);

  const initializeUserOrganizations = useCallback(async (userId: string) => {
    try {
      const userOrgs = await fetchUserOrganizations(userId);
      
      if (userOrgs.length === 0) {
        console.log("User has no organizations, attempting to add to belmorso");
        await addUserToBelmorso(userId);
        return;
      }

      setOrganizations(userOrgs);

      // Set current organization from localStorage or first available
      const storedOrgId = localStorage.getItem('currentOrganizationId');
      let orgToSet: OrganizationWithRole | null = null;

      if (storedOrgId) {
        orgToSet = userOrgs.find(org => org.id === storedOrgId) || null;
      }
      
      if (!orgToSet && userOrgs.length > 0) {
        orgToSet = userOrgs[0];
      }

      if (orgToSet) {
        setCurrentOrganization(orgToSet);
      }
    } catch (error) {
      console.error("Error in initializeUserOrganizations:", error);
    }
  }, [fetchUserOrganizations, addUserToBelmorso, setOrganizations, setCurrentOrganization]);

  return {
    getOrganizationBySlug,
    initializeUserOrganizations
  };
};
