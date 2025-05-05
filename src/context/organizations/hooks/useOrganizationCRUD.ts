
// At the top of the file, update type definition for Toast
import { nanoid } from "nanoid";
import { Organization, OrganizationMember } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

// Define the Toast type locally
type ToastFunction = typeof toast;

interface Props {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  currentOrganization: Organization | null;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>;
  setInvites: React.Dispatch<React.SetStateAction<any[]>>;
  fetchOrganizationMembers: (organizationId: string) => Promise<void>;
  fetchOrganizationInvites: (organizationId: string) => Promise<void>;
  user: User | null;
  toast: ToastFunction;
}

export const useOrganizationCRUD = ({ 
  organizations, 
  setOrganizations, 
  currentOrganization,
  setCurrentOrganization,
  setMembers,
  setInvites,
  fetchOrganizationMembers,
  fetchOrganizationInvites,
  user,
  toast
}: Props) => {
  
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
  
  return {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization
  };
};
