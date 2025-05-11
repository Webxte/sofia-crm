
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationCoreProps, useUpdateOrganizationState } from "./useOrganizationCore";

export const useOrganizationSwitch = (props: OrganizationCoreProps) => {
  const { 
    organizations, 
    setCurrentOrganization, 
    currentOrganization,
    setMembers, 
    setInvites,
    user, 
    toast 
  } = props;
  
  const { addOrganizationToState } = useUpdateOrganizationState(props);
  
  // Switch to a different organization
  const switchOrganization = async (id: string): Promise<boolean> => {
    try {
      console.log(`Attempting to switch to organization ${id}`);
      
      // Find the organization in the current list
      const org = organizations.find(o => o.id === id);
      
      // If organization wasn't found in the current list, try to fetch it
      if (!org) {
        console.log("Organization not in current list, fetching from database");
        const { data: orgData, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', id)
          .single();
          
        if (orgError) {
          console.error("Error fetching organization:", orgError);
          throw new Error(`Organization not found: ${orgError.message}`);
        }
        
        if (!orgData) {
          throw new Error("Organization not found");
        }
        
        // Format and set as current organization
        const fetchedOrg: Organization = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          logoUrl: orgData.logo_url || undefined,
          primaryColor: orgData.primary_color || undefined,
          secondaryColor: orgData.secondary_color || undefined,
          createdAt: new Date(orgData.created_at),
          updatedAt: new Date(orgData.updated_at)
        };
        
        // Store in localStorage first
        localStorage.setItem('currentOrganizationId', fetchedOrg.id);
        
        // Then update state
        setCurrentOrganization(fetchedOrg);
        console.log(`Set current organization to ${fetchedOrg.name} (ID: ${fetchedOrg.id})`);
        
        // Add to organizations list if not already there
        addOrganizationToState(fetchedOrg);
      } else {
        // Organization found in current list
        localStorage.setItem('currentOrganizationId', org.id);
        setCurrentOrganization(org);
        console.log(`Set current organization to ${org.name} (ID: ${org.id})`);
      }
      
      // Verify the current organization was set
      setTimeout(() => {
        const savedOrgId = localStorage.getItem('currentOrganizationId');
        console.log(`Verification: currentOrganizationId in localStorage: ${savedOrgId}`);
      }, 100);
      
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: 'Error',
        description: error instanceof Error 
          ? `Failed to switch organization: ${error.message}`
          : 'Failed to switch organization',
        variant: 'destructive'
      });
      return false;
    }
  };
  
  return {
    switchOrganization
  };
};
