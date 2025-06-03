
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface OrganizationMember {
  id: string;
  userId: string;
  organizationId: string;
  role: "owner" | "admin" | "member" | "manager" | "guest";
  name?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useOrganizationMembers = () => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const { toast } = useToast();

  const checkMembership = useCallback(async (organizationId: string, userId: string): Promise<boolean> => {
    if (!organizationId || !userId) {
      console.log("checkMembership: Missing organizationId or userId");
      return false;
    }

    try {
      console.log("checkMembership: Checking membership", { organizationId, userId });
      
      // Use the RPC function to check membership
      const { data, error } = await supabase.rpc('is_user_organization_member', {
        user_uuid: userId,
        org_uuid: organizationId
      });

      if (error) {
        console.error("checkMembership: Error checking membership:", error);
        return false;
      }

      console.log("checkMembership: Result:", data);
      return data === true;
    } catch (error) {
      console.error("checkMembership: Exception:", error);
      return false;
    }
  }, []);

  const ensureOrganizationMembership = useCallback(async (organizationId: string, userId: string): Promise<boolean> => {
    try {
      console.log("ensureOrganizationMembership: Checking/creating membership", { organizationId, userId });
      
      // First check if already a member
      const isMember = await checkMembership(organizationId, userId);
      if (isMember) {
        console.log("ensureOrganizationMembership: User is already a member");
        return true;
      }

      // If not a member, add them
      const { error } = await supabase
        .from('organization_members')
        .insert({
          organization_id: organizationId,
          user_id: userId,
          role: 'member'
        });

      if (error) {
        console.error("ensureOrganizationMembership: Error creating membership:", error);
        return false;
      }

      console.log("ensureOrganizationMembership: Successfully created membership");
      return true;
    } catch (error) {
      console.error("ensureOrganizationMembership: Exception:", error);
      return false;
    }
  }, [checkMembership]);

  const fetchOrganizationMembers = useCallback(async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);

      if (error) throw error;

      const formattedMembers: OrganizationMember[] = (data || []).map(member => ({
        id: member.id,
        userId: member.user_id,
        organizationId: member.organization_id,
        role: member.role as "owner" | "admin" | "member" | "manager" | "guest",
        createdAt: new Date(member.created_at),
        updatedAt: new Date(member.updated_at),
      }));

      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching organization members:', error);
      toast({
        title: "Error",
        description: "Failed to load organization members",
        variant: "destructive",
      });
    }
  }, [toast]);

  const getOrganizationMembers = useCallback(async (organizationId: string) => {
    await fetchOrganizationMembers(organizationId);
  }, [fetchOrganizationMembers]);

  const inviteMember = useCallback(async (organizationId: string, email: string, role: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organization_invites')
        .insert({
          organization_id: organizationId,
          email,
          role,
          token: crypto.randomUUID(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      return false;
    }
  }, []);

  const removeMember = useCallback(async (memberId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      return false;
    }
  }, []);

  const updateMemberRole = useCallback(async (memberId: string, role: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      return false;
    }
  }, []);

  const getUserRole = useCallback((userId: string, organizationId: string): string | null => {
    const member = members.find(m => m.userId === userId && m.organizationId === organizationId);
    return member?.role || null;
  }, [members]);

  const canUserPerformAction = useCallback((userId: string, organizationId: string, requiredRole?: string): boolean => {
    const userRole = getUserRole(userId, organizationId);
    if (!userRole) return false;
    
    if (!requiredRole) return true;
    
    const roleHierarchy = ['guest', 'member', 'manager', 'admin', 'owner'];
    const userRoleIndex = roleHierarchy.indexOf(userRole);
    const requiredRoleIndex = roleHierarchy.indexOf(requiredRole);
    
    return userRoleIndex >= requiredRoleIndex;
  }, [getUserRole]);

  return {
    members,
    setMembers,
    checkMembership,
    ensureOrganizationMembership,
    fetchOrganizationMembers,
    getOrganizationMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    getUserRole,
    canUserPerformAction,
  };
};
