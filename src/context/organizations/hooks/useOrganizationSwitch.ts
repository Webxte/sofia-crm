
import { useState } from "react";
import { Organization } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface OrganizationSwitchProps {
  organizations: Organization[];
  setCurrentOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  currentOrganization: Organization | null;
  user?: any;
  toast: any;
}

export const useOrganizationSwitch = (props: OrganizationSwitchProps) => {
  const { 
    organizations, 
    setCurrentOrganization, 
    currentOrganization,
    user,
    toast 
  } = props;
  
  const [switching, setSwitching] = useState(false);
  
  // Switch to a different organization
  const switchOrganization = async (id: string): Promise<boolean> => {
    if (switching) {
      console.log("Already in the process of switching organizations");
      return false;
    }
    
    try {
      setSwitching(true);
      console.log(`Attempting to switch to organization ${id}`);
      
      // First ensure user is a member of this organization
      await ensureUserMembership(id);
      
      // Find the organization in the current list
      let org = organizations.find(o => o.id === id);
      
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
        
        // Format the organization
        org = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          logoUrl: orgData.logo_url || undefined,
          primaryColor: orgData.primary_color || undefined,
          secondaryColor: orgData.secondary_color || undefined,
          createdAt: new Date(orgData.created_at),
          updatedAt: new Date(orgData.updated_at)
        };
      }
      
      // Store in localStorage first
      localStorage.setItem('currentOrganizationId', org.id);
      console.log(`Stored organization ID ${org.id} in localStorage`);
      
      // Then update state
      setCurrentOrganization(org);
      console.log(`Set current organization to ${org.name} (ID: ${org.id})`);
      
      // Wait a bit for state to propagate
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Verify the switch was successful
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      if (savedOrgId !== org.id) {
        throw new Error("Failed to save organization ID to localStorage");
      }
      
      console.log(`Organization switch successful: ${org.name}`);
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
    } finally {
      setSwitching(false);
    }
  };
  
  // Helper function to ensure user is a member of the organization
  const ensureUserMembership = async (orgId: string) => {
    if (!user?.id) return;
    
    try {
      // Check if user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('id')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (membershipError) {
        console.error('Error checking organization membership:', membershipError);
        return;
      }
      
      // If not a member, add them
      if (!existingMembership) {
        console.log(`Adding user ${user.id} to organization ${orgId}`);
        const { error: addMemberError } = await supabase
          .from('organization_members')
          .insert([{
            organization_id: orgId,
            user_id: user.id,
            role: 'owner' // Default to owner role for now
          }]);
        
        if (addMemberError) {
          console.error('Error creating organization member:', addMemberError);
          throw addMemberError;
        }
        
        console.log(`Successfully added user ${user.id} to organization ${orgId}`);
      } else {
        console.log(`User ${user.id} is already a member of organization ${orgId}`);
      }
    } catch (err) {
      console.error('Error ensuring user membership:', err);
    }
  };
  
  return {
    switchOrganization,
    switching
  };
};
