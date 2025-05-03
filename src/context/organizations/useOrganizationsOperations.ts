
import { useState, useEffect } from "react";
import { Organization, OrganizationMember, OrganizationInvite } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { nanoid } from "nanoid";

export const useOrganizationsOperations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [invites, setInvites] = useState<OrganizationInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch user's organizations
  const fetchOrganizations = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Get organizations the user is a member of
      const { data: memberData, error: memberError } = await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id);
      
      if (memberError) throw memberError;
      
      if (memberData.length > 0) {
        const organizationIds = memberData.map(m => m.organization_id);
        
        const { data: orgsData, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .in('id', organizationIds);
        
        if (orgsError) throw orgsError;
        
        // Format the organizations
        const formattedOrgs: Organization[] = orgsData.map(org => ({
          id: org.id,
          name: org.name,
          slug: org.slug,
          logoUrl: org.logo_url || undefined,
          primaryColor: org.primary_color || undefined,
          secondaryColor: org.secondary_color || undefined,
          createdAt: new Date(org.created_at),
          updatedAt: new Date(org.updated_at)
        }));
        
        setOrganizations(formattedOrgs);
        
        // If there's an organization ID in local storage, set that as current
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        const currentOrg = savedOrgId ? 
          formattedOrgs.find(org => org.id === savedOrgId) : 
          formattedOrgs[0] || null;
        
        if (currentOrg) {
          setCurrentOrganization(currentOrg);
          localStorage.setItem('currentOrganizationId', currentOrg.id);
          await fetchOrganizationMembers(currentOrg.id);
          await fetchOrganizationInvites(currentOrg.id);
        }
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your organizations',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
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
  
  // Fetch pending invites for the current organization
  const fetchOrganizationInvites = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organization_invites')
        .select('*')
        .eq('organization_id', organizationId);
      
      if (error) throw error;
      
      // Format the invites
      const formattedInvites: OrganizationInvite[] = data.map(invite => ({
        id: invite.id,
        organizationId: invite.organization_id,
        email: invite.email,
        role: invite.role as OrganizationMember['role'],
        token: invite.token,
        expiresAt: new Date(invite.expires_at),
        createdAt: new Date(invite.created_at),
        updatedAt: new Date(invite.updated_at)
      }));
      
      setInvites(formattedInvites);
    } catch (error) {
      console.error('Error fetching organization invites:', error);
    }
  };
  
  // Create a new organization
  const createOrganization = async (name: string, slug: string): Promise<Organization | null> => {
    if (!user) return null;
    
    try {
      // Create the organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ 
          name, 
          slug,
        }])
        .select()
        .single();
      
      if (orgError) throw orgError;
      
      // Add the creator as owner
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgData.id,
          user_id: user.id,
          role: 'owner'
        }]);
      
      if (memberError) throw memberError;
      
      // Create initial settings for the organization
      const { error: settingsError } = await supabase
        .from('settings')
        .insert([{
          organization_id: orgData.id,
          company_name: name
        }]);
      
      if (settingsError) throw settingsError;
      
      // Format the organization
      const newOrg: Organization = {
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        logoUrl: orgData.logo_url || undefined,
        primaryColor: orgData.primary_color || undefined,
        secondaryColor: orgData.secondary_color || undefined,
        createdAt: new Date(orgData.created_at),
        updatedAt: new Date(orgData.updated_at)
      };
      
      // Update state
      setOrganizations(prev => [...prev, newOrg]);
      setCurrentOrganization(newOrg);
      localStorage.setItem('currentOrganizationId', newOrg.id);
      
      // Add the owner to members
      const newMember: OrganizationMember = {
        id: nanoid(),
        organizationId: newOrg.id,
        userId: user.id,
        role: 'owner',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setMembers([newMember]);
      
      toast({
        title: 'Success',
        description: `${name} organization created successfully`,
      });
      
      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to create organization. Please try again.',
        variant: 'destructive'
      });
      return null;
    }
  };
  
  // Update organization details
  const updateOrganization = async (id: string, data: Partial<Organization>): Promise<boolean> => {
    try {
      // Convert to snake_case for Supabase
      const updateData: any = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.logoUrl !== undefined) updateData.logo_url = data.logoUrl;
      if (data.primaryColor !== undefined) updateData.primary_color = data.primaryColor;
      if (data.secondaryColor !== undefined) updateData.secondary_color = data.secondaryColor;
      
      const { error } = await supabase
        .from('organizations')
        .update(updateData)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setOrganizations(prev => 
        prev.map(org => org.id === id ? { ...org, ...data } : org)
      );
      
      if (currentOrganization?.id === id) {
        setCurrentOrganization(prev => prev ? { ...prev, ...data } : prev);
      }
      
      toast({
        title: 'Success',
        description: 'Organization updated successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to update organization',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Delete an organization
  const deleteOrganization = async (id: string): Promise<boolean> => {
    try {
      // Delete the organization (will cascade to members)
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setOrganizations(prev => prev.filter(org => org.id !== id));
      
      // If this was the current organization, set another one as current
      if (currentOrganization?.id === id) {
        const nextOrg = organizations.find(org => org.id !== id) || null;
        setCurrentOrganization(nextOrg);
        
        if (nextOrg) {
          localStorage.setItem('currentOrganizationId', nextOrg.id);
          await fetchOrganizationMembers(nextOrg.id);
          await fetchOrganizationInvites(nextOrg.id);
        } else {
          localStorage.removeItem('currentOrganizationId');
          setMembers([]);
          setInvites([]);
        }
      }
      
      toast({
        title: 'Success',
        description: 'Organization deleted successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete organization',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  // Switch to a different organization
  const switchOrganization = async (id: string): Promise<boolean> => {
    try {
      const org = organizations.find(o => o.id === id);
      if (!org) throw new Error('Organization not found');
      
      setCurrentOrganization(org);
      localStorage.setItem('currentOrganizationId', org.id);
      
      // Fetch members and invites for the new current organization
      await fetchOrganizationMembers(org.id);
      await fetchOrganizationInvites(org.id);
      
      // Reload all data for the new organization
      // (This should be handled by the parent component)
      
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch organization',
        variant: 'destructive'
      });
      return false;
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
      
      // Add to local state
      const newInvite: OrganizationInvite = {
        id: data.id,
        organizationId: data.organization_id,
        email: data.email,
        role: data.role as OrganizationMember['role'],
        token: data.token,
        expiresAt: new Date(data.expires_at),
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      setInvites(prev => [...prev, newInvite]);
      
      toast({
        title: 'Success',
        description: `Invitation sent to ${email}`,
      });
      
      // TODO: Send invitation email
      
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
  
  useEffect(() => {
    if (user) {
      fetchOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setMembers([]);
      setInvites([]);
    }
  }, [user?.id]);
  
  return {
    organizations,
    currentOrganization,
    members,
    invites,
    loading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    getUserRole,
    canUserPerformAction,
    fetchOrganizations,
  };
};
