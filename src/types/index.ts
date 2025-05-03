// Contact types
export interface Contact {
  id: string;
  fullName?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  company?: string;
  position?: string;
  source?: string; // Added source/tag field
  organizationId?: string; // Added for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

// Meeting types
export interface Meeting {
  id: string;
  contactId: string;
  contactName?: string; // Add contactName property
  type: "meeting" | "phone" | "email" | "online" | "other";
  date: Date;
  time: string;
  location?: string;
  notes: string;
  followUpScheduled: boolean;
  followUpDate?: Date | null;
  followUpTime?: string;
  followUpNotes?: string;
  nextSteps?: string[];
  agentId?: string;
  agentName?: string;
  organizationId?: string; // Added for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

// Task types
export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  dueTime?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  contactId?: string;
  contactName?: string; // Add contactName property
  agentId?: string;
  agentName?: string;
  organizationId?: string; // Added for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

// Product types
export interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  cost: number;
  vat?: number;
  caseQuantity?: number;
  firstOrderCommission?: number;
  nextOrdersCommission?: number;
  organizationId?: string; // Added for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface OrderItem {
  id: string;
  productId: string;
  code: string;
  description: string;
  price: number;
  quantity: number;
  vat?: number;
  subtotal: number;
  product: Product;
}

export interface Order {
  id: string;
  contactId: string;
  agentId?: string;
  agentName?: string;
  date: Date;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
  items: OrderItem[];
  total: number;
  vatTotal?: number;
  notes?: string;
  termsAndConditions?: string;
  reference?: string;
  organizationId?: string; // Added for multi-tenancy
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
  organizationId?: string; // Added for multi-tenancy
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
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

// Analytics event type
export interface AnalyticsEvent {
  id: string;
  organizationId?: string;
  userId?: string;
  eventName: string;
  eventData?: Record<string, any>;
  createdAt: Date;
}

// Custom Link interface for settings
export interface CustomLink {
  url: string;
  description: string;
}

// Settings types
export interface Settings {
  id?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  terms?: string; // Terms property
  defaultTermsAndConditions?: string;
  termsEnabled?: boolean;
  defaultVatRate?: number;
  defaultEmailSubject?: string;
  defaultEmailMessage?: string;
  defaultContactEmailMessage?: string;
  emailFooter?: string;
  emailSenderName?: string;
  showFooterInEmails?: boolean;
  catalogUrl?: string;
  priceListUrl?: string;
  customLinks?: CustomLink[];
  bulkEmailTemplate?: string;
  organizationId?: string; // Added for multi-tenancy
}
