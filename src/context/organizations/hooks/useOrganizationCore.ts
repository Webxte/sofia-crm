
import { Organization, OrganizationMember } from "@/types";
import { User } from "@supabase/supabase-js";
import { toast } from "@/hooks/use-toast";

// Define the Toast type locally
type ToastFunction = typeof toast;

export interface OrganizationCoreProps {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  currentOrganization: Organization | null;
  setCurrentOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  setMembers: React.Dispatch<React.SetStateAction<OrganizationMember[]>>;
  setInvites: React.Dispatch<React.SetStateAction<any[]>>;
  user: User | null;
  toast: ToastFunction;
}

export const useUpdateOrganizationState = (props: OrganizationCoreProps) => {
  const { setOrganizations, setCurrentOrganization } = props;

  // Helper function to update organizations in state
  const updateOrganizationInState = (id: string, data: Partial<Organization>) => {
    setOrganizations(prev => 
      prev.map(org => org.id === id ? { ...org, ...data } : org)
    );
    
    // Update current organization if it's the one being updated
    if (props.currentOrganization?.id === id) {
      setCurrentOrganization(prev => prev ? { ...prev, ...data } : prev);
    }
  };

  // Helper function to add organization to state
  const addOrganizationToState = (org: Organization) => {
    setOrganizations(prev => {
      if (prev.some(o => o.id === org.id)) return prev;
      return [...prev, org];
    });
  };

  // Helper function to remove organization from state
  const removeOrganizationFromState = (id: string) => {
    setOrganizations(prev => prev.filter(org => org.id !== id));
  };

  return {
    updateOrganizationInState,
    addOrganizationToState,
    removeOrganizationFromState
  };
};
