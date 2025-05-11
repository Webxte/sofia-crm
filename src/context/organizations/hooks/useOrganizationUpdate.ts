
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationCoreProps, useUpdateOrganizationState } from "./useOrganizationCore";

export const useOrganizationUpdate = (props: OrganizationCoreProps) => {
  const { 
    currentOrganization,
    setCurrentOrganization, 
    setMembers, 
    setInvites, 
    toast 
  } = props;
  
  const { updateOrganizationInState, removeOrganizationFromState } = useUpdateOrganizationState(props);
  
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
      updateOrganizationInState(id, data);
      
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
      
      // If this was the current organization, set another one as current
      if (currentOrganization?.id === id) {
        removeOrganizationFromState(id);
        const remainingOrgs = props.organizations.filter(org => org.id !== id);
        const nextOrg = remainingOrgs[0] || null;
        
        setCurrentOrganization(nextOrg);
        
        if (nextOrg) {
          localStorage.setItem('currentOrganizationId', nextOrg.id);
        } else {
          localStorage.removeItem('currentOrganizationId');
          setMembers([]);
          setInvites([]);
        }
      } else {
        removeOrganizationFromState(id);
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
  
  return {
    updateOrganization,
    deleteOrganization
  };
};
