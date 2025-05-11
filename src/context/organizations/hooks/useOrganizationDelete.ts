
import { supabase } from "@/integrations/supabase/client";
import { OrganizationHookProps } from "./useOrganizationCRUD";

/**
 * Hook for organization deletion functionality
 */
export const useOrganizationDelete = (props: OrganizationHookProps) => {
  const { 
    organizations, 
    setOrganizations, 
    currentOrganization,
    setCurrentOrganization, 
    toast 
  } = props;
  
  /**
   * Delete an organization
   */
  const deleteOrganization = async (id: string): Promise<boolean> => {
    try {
      // Confirm with the user before deletion
      if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
        return false;
      }
      
      // Delete organization from Supabase
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setOrganizations(organizations.filter(org => org.id !== id));
      
      // If deleted the current organization, reset to another one
      if (currentOrganization && currentOrganization.id === id) {
        const nextOrg = organizations.find(org => org.id !== id);
        if (nextOrg) {
          localStorage.setItem('currentOrganizationId', nextOrg.id);
          setCurrentOrganization(nextOrg);
        } else {
          localStorage.removeItem('currentOrganizationId');
          setCurrentOrganization(null);
        }
      }
      
      toast({
        title: "Organization deleted",
        description: "The organization has been successfully deleted."
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? `Failed to delete organization: ${error.message}`
          : 'Failed to delete organization',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return {
    deleteOrganization
  };
};
