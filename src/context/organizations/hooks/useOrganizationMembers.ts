
import { useState } from "react";
import { Organization, OrganizationMember } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

// Define the Toast type locally
type Toast = typeof toast;

interface Props {
  currentOrganization: Organization | null;
  user: User | null;
  toast: Toast;
}

export const useOrganizationMembers = ({ currentOrganization, user, toast }: Props) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  
  // Fetch members of current organization
  const fetchOrganizationMembers = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      
      // Format the members
      const formattedMembers: OrganizationMember[] = data.map(member => ({
        id: member.id,
        organizationId: member.organization_id,
        userId: member.user_id,
        role: member.role as OrganizationMember['role'],
        createdAt: new Date(member.created_at),
        updatedAt: new Date(member.updated_at)
      }));
      
      setMembers(formattedMembers);
    } catch (error) {
      console.error('Error fetching organization members:', error);
    }
  };

  // Get organization members by slug
  const getOrganizationMembers = async (slug: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      
      if (data) {
        await fetchOrganizationMembers(data.id);
      }
    } catch (error) {
      console.error('Error fetching organization members by slug:', error);
    }
  };
  
  // Invite someone to the organization
  const inviteMember = async (email: string, role: OrganizationMember['role']): Promise<boolean> => {
    if (!currentOrganization) return false;
    
    try {
      // Generate expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      // Create token
      const token = nanoid(24);
      
      const { data, error } = await supabase
        .from('organization_invites')
        .insert([{
          organization_id: currentOrganization.id,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Invitation sent to ${email}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: 'Error',
        description: 'Failed to send invitation',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Remove a member from the organization
  const removeMember = async (userId: string): Promise<boolean> => {
    if (!currentOrganization) return false;
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .match({
          organization_id: currentOrganization.id,
          user_id: userId
        });
      
      if (error) throw error;
      
      // Update local state
      setMembers(prev => prev.filter(m => m.userId !== userId));
      
      toast({
        title: 'Success',
        description: 'Member removed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Update a member's role
  const updateMemberRole = async (userId: string, role: OrganizationMember['role']): Promise<boolean> => {
    if (!currentOrganization) return false;
    
    try {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .match({
          organization_id: currentOrganization.id,
          user_id: userId
        });
      
      if (error) throw error;
      
      // Update local state
      setMembers(prev => prev.map(m => 
        m.userId === userId ? { ...m, role } : m
      ));
      
      toast({
        title: 'Success',
        description: 'Member role updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Get current user's role in the organization
  const getUserRole = (): OrganizationMember['role'] | null => {
    if (!currentOrganization || !user) return null;
    
    const member = members.find(m => m.userId === user.id);
    return member?.role || null;
  };
  
  // Check if user can perform an action based on their role
  const canUserPerformAction = (action: "delete" | "update" | "invite"): boolean => {
    const role = getUserRole();
    
    if (!role) return false;
    
    switch(action) {
      case "delete":
        return role === 'owner';
      case "update":
        return ['owner', 'admin'].includes(role);
      case "invite":
        return ['owner', 'admin'].includes(role);
      default:
        return false;
    }
  };
  
  return {
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
