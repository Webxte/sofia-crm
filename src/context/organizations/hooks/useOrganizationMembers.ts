
import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OrganizationMember } from "@/types";

export const useOrganizationMembers = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<OrganizationMember[]>([]);

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
          role: 'member'
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

  const fetchOrganizationMembers = useCallback(async (organizationId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) {
        console.error("Error fetching organization members:", error);
        return;
      }

      const formattedMembers: OrganizationMember[] = data.map(member => ({
        id: member.id,
        organizationId: member.organization_id,
        userId: member.user_id,
        role: member.role as "owner" | "admin" | "member" | "manager" | "guest",
        createdAt: new Date(member.created_at),
        updatedAt: new Date(member.updated_at)
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error("Error in fetchOrganizationMembers:", error);
    }
  }, []);

  const getOrganizationMembers = useCallback(async (organizationId: string): Promise<void> => {
    await fetchOrganizationMembers(organizationId);
  }, [fetchOrganizationMembers]);

  const inviteMember = useCallback(async (email: string, role: "owner" | "admin" | "member" | "manager" | "guest"): Promise<boolean> => {
    try {
      // Implementation for inviting members
      console.log("Inviting member:", email, "with role:", role);
      // Add actual implementation here
      return true;
    } catch (error) {
      console.error("Error inviting member:", error);
      return false;
    }
  }, []);

  const removeMember = useCallback(async (userId: string): Promise<boolean> => {
    try {
      // Implementation for removing members
      console.log("Removing member:", userId);
      // Add actual implementation here
      return true;
    } catch (error) {
      console.error("Error removing member:", error);
      return false;
    }
  }, []);

  const updateMemberRole = useCallback(async (userId: string, role: "owner" | "admin" | "member" | "manager" | "guest"): Promise<boolean> => {
    try {
      // Implementation for updating member role
      console.log("Updating member role:", userId, "to:", role);
      // Add actual implementation here
      return true;
    } catch (error) {
      console.error("Error updating member role:", error);
      return false;
    }
  }, []);

  const getUserRole = useCallback((): "owner" | "admin" | "member" | "manager" | "guest" | null => {
    // Implementation for getting user role
    return null;
  }, []);

  const canUserPerformAction = useCallback((action: "delete" | "update" | "invite"): boolean => {
    // Implementation for checking user permissions
    console.log("Checking permission for action:", action);
    return true;
  }, []);

  return {
    ensureOrganizationMembership,
    checkMembership,
    members,
    setMembers,
    fetchOrganizationMembers,
    getOrganizationMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    getUserRole,
    canUserPerformAction
  };
};
