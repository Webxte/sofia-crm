
import { Organization, OrganizationMember, OrganizationInvite } from "@/types";

export interface OrganizationsContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
  loading: boolean;
  createOrganization: (name: string, slug: string) => Promise<Organization | null>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<boolean>;
  deleteOrganization: (id: string) => Promise<boolean>;
  switchOrganization: (id: string) => Promise<boolean>;
  inviteMember: (email: string, role: OrganizationMember['role']) => Promise<boolean>;
  removeMember: (userId: string) => Promise<boolean>;
  updateMemberRole: (userId: string, role: OrganizationMember['role']) => Promise<boolean>;
  getUserRole: () => OrganizationMember['role'] | null;
  canUserPerformAction: (action: "delete" | "update" | "invite") => boolean;
  
  // Add missing properties and methods
  organization: Organization | null;
  getOrganizationBySlug: (slug: string) => Promise<Organization | null>;
  getOrganizationMembers: (slug: string) => Promise<void>;
  fetchOrganizations: () => Promise<void>;
}
