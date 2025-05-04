
import { useState, useEffect } from "react";
import { Organization } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Hooks for different operations
import { useOrganizationCRUD } from "./hooks/useOrganizationCRUD";
import { useOrganizationMembers } from "./hooks/useOrganizationMembers";
import { useOrganizationInvites } from "./hooks/useOrganizationInvites";
import { useOrganizationFetch } from "./hooks/useOrganizationFetch";

export const useOrganizationsOperations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Initialize all our organization operation hooks
  const { 
    fetchOrganizations, 
    getOrganizationBySlug, 
    loading: fetchLoading 
  } = useOrganizationFetch({ 
    setOrganizations, 
    setCurrentOrganization, 
    setOrganization, 
    toast 
  });
  
  const {
    members, 
    setMembers,
    fetchOrganizationMembers,
    getOrganizationMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
    getUserRole,
    canUserPerformAction
  } = useOrganizationMembers({ 
    currentOrganization, 
    user, 
    toast 
  });
  
  const { 
    invites, 
    setInvites,
    fetchOrganizationInvites 
  } = useOrganizationInvites({ 
    currentOrganization, 
    toast 
  });
  
  const {
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization
  } = useOrganizationCRUD({ 
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
  });
  
  // Fetch organizations when user changes
  useEffect(() => {
    if (user) {
      fetchOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setOrganization(null);
      setMembers([]);
      setInvites([]);
    }
  }, [user?.id]);
  
  // Sync loading state from fetch hook
  useEffect(() => {
    setLoading(fetchLoading);
  }, [fetchLoading]);
  
  return {
    organizations,
    currentOrganization,
    organization,
    members,
    invites,
    loading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    switchOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
    getUserRole,
    canUserPerformAction,
    fetchOrganizations,
    getOrganizationBySlug,
    getOrganizationMembers,
  };
};
