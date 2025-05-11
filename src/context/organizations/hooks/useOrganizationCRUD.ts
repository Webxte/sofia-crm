
import { Organization, OrganizationMember } from "@/types";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { useOrganizationCreate } from "./useOrganizationCreate";
import { useOrganizationUpdate } from "./useOrganizationUpdate";
import { useOrganizationSwitch } from "./useOrganizationSwitch";
import { useOrganizationDelete } from "./useOrganizationDelete";

// Define the core properties used by organization hooks
export interface OrganizationHookProps {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  currentOrganization: Organization | null;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>;
  setInvites: React.Dispatch<React.SetStateAction<any[]>>;
  fetchOrganizationMembers: (organizationId: string) => Promise<void>;
  fetchOrganizationInvites: (organizationId: string) => Promise<void>;
  user: User | null;
  toast: typeof toast;
}

/**
 * Main hook that combines all organization CRUD operations
 */
export const useOrganizationCRUD = (props: OrganizationHookProps) => {
  // Get organization CRUD operations from sub-hooks
  const { createOrganization } = useOrganizationCreate(props);
  const { updateOrganization } = useOrganizationUpdate(props);
  const { deleteOrganization } = useOrganizationDelete(props);
  const { switchOrganization } = useOrganizationSwitch(props);
  
  return {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization
  };
};
