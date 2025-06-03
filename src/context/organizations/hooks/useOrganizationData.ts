
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Organization } from "@/types";
import { OrganizationWithRole } from "../types";

export const useOrganizationData = () => {
  const getOrganizationBySlug = useCallback(async (slug: string): Promise<Organization | null> => {
    console.log("Getting organization by slug:", slug);
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) {
        console.error("Error fetching organization by slug:", error);
        return null;
      }

      if (!data) {
        console.log("No organization found with slug:", slug);
        return null;
      }

      console.log("Found organization:", data.name);
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        logoUrl: data.logo_url,
        primaryColor: data.primary_color,
        secondaryColor: data.secondary_color,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error in getOrganizationBySlug:", error);
      return null;
    }
  }, []);

  const fetchUserOrganizations = useCallback(async (userId: string): Promise<OrganizationWithRole[]> => {
    try {
      console.log("Fetching organizations for user:", userId);
      
      // Use the security definer function to get memberships
      const { data: memberships, error } = await supabase.rpc(
        'get_user_organization_memberships',
        { user_uuid: userId }
      );

      if (error) {
        console.error("Error fetching organization memberships:", error);
        throw error;
      }

      console.log("Raw organization memberships:", memberships);

      if (!memberships || memberships.length === 0) {
        console.log("User has no organizations");
        return [];
      }

      // Get organization details
      const orgIds = memberships.map((m: any) => m.organization_id);
      const { data: orgsData, error: orgsError } = await supabase
        .from('organizations')
        .select('*')
        .in('id', orgIds);

      if (orgsError) throw orgsError;

      const orgs: OrganizationWithRole[] = orgsData.map(org => {
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
          role: membership?.role as "owner" | "admin" | "member" | "manager" | "guest"
        };
      });

      console.log("Formatted organizations:", orgs);
      return orgs;
    } catch (error) {
      console.error("Error in fetchUserOrganizations:", error);
      return [];
    }
  }, []);

  return {
    getOrganizationBySlug,
    fetchUserOrganizations
  };
};
