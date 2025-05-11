
import { nanoid } from "nanoid";
import { Organization, OrganizationMember } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { OrganizationCoreProps } from "./useOrganizationCore";

export const useOrganizationCreate = (props: OrganizationCoreProps) => {
  const { 
    setOrganizations, 
    setCurrentOrganization, 
    setMembers, 
    user, 
    toast 
  } = props;
  
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
  
  return {
    createOrganization
  };
};
