
import { Organization, OrganizationMember, OrganizationInvite } from "@/types";

// Extended Organization type that includes role information
export interface OrganizationWithRole extends Organization {
  role?: OrganizationMember['role'];
}

export interface OrganizationsContextType {
  organizations: OrganizationWithRole[];
  currentOrganization: OrganizationWithRole | null;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
  loading: boolean;
  isLoadingOrganizations: boolean;
  initialLoadComplete: boolean;
  createOrganization: (name: string, slug: string) => Promise<Organization | null>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<boolean>;
  deleteOrganization: (id: string) => Promise<boolean>;
  switchOrganization: (id: string) => Promise<boolean>;
  inviteMember: (email: string, role: OrganizationMember['role']) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  updateMemberRole: (userId: string, role: OrganizationMember['role']) => Promise<boolean>;
  getUserRole: () => OrganizationMember['role'] | null;
  canUserPerformAction: (action: "delete" | "update" | "invite") => boolean;
  
  // Missing properties and methods
  organization: OrganizationWithRole | null;
  getOrganizationBySlug: (slug: string) => Promise<Organization | null>;
  getOrganizationMembers: (slug: string) => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  checkMembership: (organizationId: string) => Promise<boolean>;
  setCurrentOrganization: (organization: OrganizationWithRole | null) => void;
}

// Export the Organization type for use in other files
export type { Organization, OrganizationMember, OrganizationInvite } from "@/types";
