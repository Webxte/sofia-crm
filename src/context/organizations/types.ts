
import { Organization, OrganizationMember, OrganizationInvite } from "@/types";

// Extended Organization type that includes role information
export interface OrganizationWithRole extends Organization {
  role?: "owner" | "admin" | "member" | "manager" | "guest";
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
  inviteMember: (email: string, role: "owner" | "admin" | "member" | "manager" | "guest") => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  updateMemberRole: (userId: string, role: "owner" | "admin" | "member" | "manager" | "guest") => Promise<boolean>;
  getUserRole: () => "owner" | "admin" | "member" | "manager" | "guest" | null;
  canUserPerformAction: (action: "delete" | "update" | "invite") => boolean;
  
  // Additional properties and methods
  organization: OrganizationWithRole | null;
  getOrganizationBySlug: (slug: string) => Promise<Organization | null>;
  getOrganizationMembers: (slug: string) => Promise<void>;
  fetchOrganizations: () => Promise<void>;
  checkMembership: (organizationId: string) => Promise<boolean>;
  setCurrentOrganization: (organization: OrganizationWithRole | null) => void;
}

// Export the Organization type for use in other files
export type { Organization, OrganizationMember, OrganizationInvite } from "@/types";
