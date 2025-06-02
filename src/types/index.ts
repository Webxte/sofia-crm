// Core entity types matching the database schema

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "manager" | "member" | "guest";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: "owner" | "admin" | "manager" | "member" | "guest";
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  organizationId: string;
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  address?: string;
  source?: string;
  notes?: string;
  agentId?: string;
  agentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  organizationId: string;
  contactId: string;
  contactName?: string;
  type: "meeting" | "phone" | "email" | "online" | "other";
  date: string; // Always ISO date string to match database
  time: string;
  location?: string;
  notes: string;
  nextSteps?: string[];
  agentId?: string;
  agentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  organizationId: string;
  contactId?: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO date string
  dueTime?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  contactName?: string;
  agentId?: string;
  agentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  organizationId: string;
  code: string;
  description: string;
  price: number;
  cost: number;
  vat?: number;
  caseQuantity?: number;
  firstOrderCommission?: number;
  nextOrdersCommission?: number;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  organizationId: string;
  contactId: string;
  date: string; // ISO date string
  reference?: string;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
  total: number;
  vatTotal?: number;
  notes?: string;
  termsAndConditions?: string;
  agentId?: string;
  agentName?: string;
  items?: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  code: string;
  description: string;
  quantity: number;
  price: number;
  vat?: number;
  subtotal: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  organizationId?: string;
  organization_id?: string;
  companyName?: string;
  company_name?: string;
  companyEmail?: string;
  company_email?: string;
  companyPhone?: string;
  company_phone?: string;
  companyAddress?: string;
  company_address?: string;
  primaryColor?: string;
  primary_color?: string;
  secondaryColor?: string;
  secondary_color?: string;
  defaultVatRate: number;
  default_vat_rate?: number;
  termsEnabled: boolean;
  terms_enabled?: boolean;
  terms?: string;
  defaultTermsAndConditions?: string;
  default_terms_and_conditions?: string;
  catalogUrl?: string;
  catalog_url?: string;
  priceListUrl?: string;
  price_list_url?: string;
  customLinks: CustomLink[];
  custom_links?: CustomLink[];
  bulkEmailTemplate?: string;
  bulk_email_template?: string;
  defaultContactEmailMessage?: string;
  default_contact_email_message?: string;
  defaultEmailSubject?: string;
  default_email_subject?: string;
  defaultEmailMessage?: string;
  default_email_message?: string;
  emailFooter: string;
  email_footer?: string;
  emailSenderName: string;
  email_sender_name?: string;
  showFooterInEmails?: boolean;
  show_footer_in_emails?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomLink {
  id?: string;
  name?: string;
  url: string;
  description?: string;
}

// Filter and search types
export interface ContactFilter {
  search?: string;
  source?: string;
  agentId?: string;
  company?: string;
}

export interface MeetingFilter {
  search?: string;
  type?: string;
  agentId?: string;
  contactId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface TaskFilter {
  search?: string;
  status?: "active" | "completed" | "all";
  priority?: "low" | "medium" | "high";
  agentId?: string;
  contactId?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface OrderFilter {
  search?: string;
  status?: string;
  agentId?: string;
  contactId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ProductFilter {
  search?: string;
  code?: string;
}

// Sort options
export interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

// Pagination
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Form types
export interface ContactFormData {
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  address?: string;
  source?: string;
  notes?: string;
}

export interface MeetingFormData {
  contactId: string;
  type: "meeting" | "phone" | "email" | "online" | "other";
  date: string;
  time: string;
  location?: string;
  notes: string;
  nextSteps?: string[];
}

export interface TaskFormData {
  contactId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
}

export interface OrderFormData {
  contactId: string;
  date: string;
  reference?: string;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
  notes?: string;
  termsAndConditions?: string;
  items: OrderItemFormData[];
}

export interface OrderItemFormData {
  productId: string;
  quantity: number;
  price?: number;
  vat?: number;
}

export interface ProductFormData {
  code: string;
  description: string;
  price: number;
  cost: number;
  vat?: number;
  caseQuantity?: number;
  firstOrderCommission?: number;
  nextOrdersCommission?: number;
  imageUrl?: string;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ListResponse<T> {
  data: T[];
  pagination: PaginationInfo;
  success: boolean;
  message?: string;
}

// Email types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  type: "contact" | "meeting" | "order" | "task";
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: EmailAttachment[];
}

export interface EmailAttachment {
  name: string;
  content: string;
  type: string;
}

// Analytics types
export interface AnalyticsData {
  totalContacts: number;
  totalMeetings: number;
  totalTasks: number;
  totalOrders: number;
  completedTasks: number;
  activeTasks: number;
  monthlyOrders: number;
  monthlyRevenue: number;
  topAgents: AgentStats[];
  contactsBySource: SourceStats[];
  tasksByPriority: PriorityStats[];
  ordersByStatus: StatusStats[];
}

export interface AgentStats {
  agentId: string;
  agentName: string;
  contactsCount: number;
  meetingsCount: number;
  tasksCount: number;
  ordersCount: number;
  revenue: number;
}

export interface SourceStats {
  source: string;
  count: number;
  percentage: number;
}

export interface PriorityStats {
  priority: "low" | "medium" | "high";
  count: number;
  percentage: number;
}

export interface StatusStats {
  status: string;
  count: number;
  percentage: number;
}

// Import/Export types
export interface ImportResult {
  success: boolean;
  imported: number;
  errors: ImportError[];
  skipped: number;
}

export interface ImportError {
  row: number;
  field: string;
  value: string;
  error: string;
}

export interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  fields: string[];
  filters?: Record<string, any>;
}

// Notification types
export interface Notification {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// User types (extending Supabase User)
export interface ExtendedUser {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  organizationId?: string;
  user_metadata?: {
    name?: string;
    role?: string;
    [key: string]: any;
  };
}

// Context types
export interface AuthContextType {
  user: ExtendedUser | null;
  session: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  createUser: (name: string, email: string, password: string, role: "admin" | "agent") => Promise<void>;
  logout: () => Promise<void>;
}

export interface OrganizationContextType {
  organizations: Organization[];
  currentOrganization: Organization | null;
  members: OrganizationMember[];
  invites: OrganizationInvite[];
  isLoading: boolean;
  createOrganization: (data: Partial<Organization>) => Promise<Organization | null>;
  updateOrganization: (id: string, data: Partial<Organization>) => Promise<Organization | null>;
  deleteOrganization: (id: string) => Promise<boolean>;
  switchOrganization: (id: string) => Promise<void>;
  inviteMember: (email: string, role: string) => Promise<boolean>;
  removeMember: (memberId: string) => Promise<boolean>;
  updateMemberRole: (memberId: string, role: string) => Promise<boolean>;
  refreshOrganizations: () => Promise<void>;
}

// Database types (for internal use)
export interface DatabaseContact {
  id: string;
  organization_id: string;
  full_name?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  address?: string;
  source?: string;
  notes?: string;
  agent_id?: string;
  agent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMeeting {
  id: string;
  organization_id: string;
  contact_id: string;
  contact_name?: string;
  type: string;
  date: string;
  time: string;
  location?: string;
  notes: string;
  next_steps?: string[];
  agent_id?: string;
  agent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseTask {
  id: string;
  organization_id: string;
  contact_id?: string;
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority: string;
  status: string;
  contact_name?: string;
  agent_id?: string;
  agent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseOrder {
  id: string;
  organization_id: string;
  contact_id: string;
  date: string;
  reference?: string;
  status: string;
  total: number;
  vat_total?: number;
  notes?: string;
  terms_and_conditions?: string;
  agent_id?: string;
  agent_name?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProduct {
  id: string;
  organization_id: string;
  code: string;
  description: string;
  price: number;
  cost: number;
  vat?: number;
  case_quantity?: number;
  first_order_commission?: number;
  next_orders_commission?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

// Utility types
export type EntityType = "contact" | "meeting" | "task" | "order" | "product";
export type ActionType = "create" | "update" | "delete" | "view";
export type SortDirection = "asc" | "desc";
export type ViewMode = "grid" | "list" | "table";
export type DateRange = "today" | "week" | "month" | "quarter" | "year" | "custom";

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: string;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Theme types
export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface ThemeConfig {
  colors: ThemeColors;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
  };
}
