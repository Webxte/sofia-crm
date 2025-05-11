
import { Organization, OrganizationMember } from "@/types";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";
import { useOrganizationCreate } from "./useOrganizationCreate";
import { useOrganizationUpdate } from "./useOrganizationUpdate";
import { useOrganizationSwitch } from "./useOrganizationSwitch";

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

export const useOrganizationCRUD = (props: Props) => {
  // Get organization CRUD operations from sub-hooks
  const { createOrganization } = useOrganizationCreate(props);
  const { updateOrganization, deleteOrganization } = useOrganizationUpdate(props);
  const { switchOrganization } = useOrganizationSwitch(props);
  
  return {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization
  };
};
