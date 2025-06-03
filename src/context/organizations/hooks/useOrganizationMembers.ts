
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useOrganizationMembers = () => {
  const { toast } = useToast();

  const ensureOrganizationMembership = useCallback(async (organizationId: string, userId: string): Promise<boolean> => {
    try {
      console.log("Checking membership for user:", userId, "in organization:", organizationId);
      
      // Check if user is already a member
      const { data: isMember, error: checkError } = await supabase.rpc(
        'is_member_of_organization',
        {
          _user_id: userId,
          _organization_id: organizationId
        }
      );

      if (checkError) {
        console.error("Error checking membership:", checkError);
        return false;
      }

      if (isMember) {
        console.log("User is already a member of organization:", organizationId);
        return true;
      }

      console.log("Adding user to organization:", organizationId);
      const { error: addError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role: 'agent'
        });

      if (addError) {
        console.error("Error adding user to organization:", addError);
        return false;
      }

      console.log("Successfully added user to organization:", organizationId);
      return true;
    } catch (error) {
      console.error("Error in ensureOrganizationMembership:", error);
      return false;
    }
  }, []);

  const checkMembership = useCallback(async (organizationId: string, userId: string): Promise<boolean> => {
    if (!userId) return false;

    try {
      const { data, error } = await supabase.rpc(
        'is_member_of_organization',
        {
          _user_id: userId,
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
  }, []);

  return {
    ensureOrganizationMembership,
    checkMembership
  };
};
