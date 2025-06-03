
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Organization } from "@/types";
import { OrganizationWithRole } from "../types";

export const useOrganizationManagement = (
  organizations: OrganizationWithRole[],
  setOrganizations: React.Dispatch<React.SetStateAction<OrganizationWithRole[]>>,
  setCurrentOrganization: React.Dispatch<React.SetStateAction<OrganizationWithRole | null>>
) => {
  const { user } = useAuth();

  const switchOrganization = useCallback(async (organizationId: string): Promise<boolean> => {
    try {
      console.log("Attempting to switch to organization ID:", organizationId);
      
      let targetOrg = organizations.find(org => org.id === organizationId);
      
      if (!targetOrg) {
        console.log("Organization not in current list, fetching from database");
        const { data: orgData, error } = await supabase
          .from('organizations')
          .select('*')
          .eq('id', organizationId)
          .single();
          
        if (error) {
          console.error("Error fetching organization:", error);
          return false;
        }
        
        targetOrg = {
          id: orgData.id,
          name: orgData.name,
          slug: orgData.slug,
          logoUrl: orgData.logo_url,
          primaryColor: orgData.primary_color,
          secondaryColor: orgData.secondary_color,
          createdAt: new Date(orgData.created_at),
          updatedAt: new Date(orgData.updated_at),
          role: 'member' as "owner" | "admin" | "member" | "manager" | "guest"
        };
        
        setOrganizations(prev => {
          const exists = prev.find(org => org.id === organizationId);
          return exists ? prev : [...prev, targetOrg!];
        });
      }

      console.log("Switching to organization:", targetOrg.name);
      setCurrentOrganization(targetOrg);
      localStorage.setItem('currentOrganizationId', organizationId);
      
      return true;
    } catch (error) {
      console.error('Error switching organization:', error);
      return false;
    }
  }, [organizations, setOrganizations, setCurrentOrganization]);

  const createOrganization = useCallback(async (name: string, slug: string): Promise<Organization | null> => {
    if (!user?.id) {
      return null;
    }

    try {
      console.log("Creating new organization:", name, slug);
      
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{
          name,
          slug,
        }])
        .select()
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        return null;
      }

      const { error: memberError } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: orgData.id,
          user_id: user.id,
          role: 'owner'
        }]);

      if (memberError) {
        console.error('Error adding user to organization:', memberError);
        await supabase.from('organizations').delete().eq('id', orgData.id);
        return null;
      }

      const newOrg: Organization = {
        id: orgData.id,
        name: orgData.name,
        slug: orgData.slug,
        logoUrl: orgData.logo_url,
        primaryColor: orgData.primary_color,
        secondaryColor: orgData.secondary_color,
        createdAt: new Date(orgData.created_at),
        updatedAt: new Date(orgData.updated_at),
      };

      const newOrgWithRole: OrganizationWithRole = { ...newOrg, role: 'owner' as "owner" | "admin" | "member" | "manager" | "guest" };
      setOrganizations(prev => [...prev, newOrgWithRole]);
      setCurrentOrganization(newOrgWithRole);
      localStorage.setItem('currentOrganizationId', newOrg.id);

      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      return null;
    }
  }, [user, setOrganizations, setCurrentOrganization]);

  const updateOrganization = useCallback(async (id: string, data: Partial<Organization>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', id);

      if (error) {
        console.error('Error updating organization:', error);
        return false;
      }

      setOrganizations(prev => 
        prev.map(org => org.id === id ? { ...org, ...data } : org)
      );

      setCurrentOrganization(prev => prev?.id === id ? { ...prev, ...data } : prev);

      return true;
    } catch (error) {
      console.error('Error updating organization:', error);
      return false;
    }
  }, [setOrganizations, setCurrentOrganization]);

  return {
    switchOrganization,
    createOrganization,
    updateOrganization
  };
};
