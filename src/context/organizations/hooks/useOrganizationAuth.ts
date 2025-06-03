
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Organization } from "@/types";
import { OrganizationWithRole } from "../types";

export const useOrganizationAuth = () => {
  const { user } = useAuth();

  const getOrganizationBySlug = useCallback(async (slug: string): Promise<Organization | null> => {
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
          return null;
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
  }, []);

  const checkMembership = useCallback(async (organizationId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc(
        'is_member_of_organization',
        {
          _user_id: user.id,
          _organization_id: organizationId
        }
      );

      if (error) {
        console.error("Error checking membership:", error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error("Error checking membership:", error);
      return false;
    }
  }, [user]);

  const ensureOrganizationMembership = useCallback(async (orgId: string, userId: string): Promise<boolean> => {
    try {
      const isMember = await checkMembership(orgId);
      
      if (isMember) {
        console.log("User is already a member of organization:", orgId);
        return true;
      }

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
  }, [checkMembership]);

  return {
    getOrganizationBySlug,
    checkMembership,
    ensureOrganizationMembership
  };
};
