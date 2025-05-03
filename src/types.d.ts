
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
  role: 'owner' | 'admin' | 'member';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: OrganizationMember['role'];
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  position?: string;
  address?: string;
  notes?: string;
  source?: string;
  agentId?: string;
  agentName?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  contactId: string;
  contactName?: string;
  date: string;
  time: string;
  type: "meeting" | "phone" | "email" | "online" | "other";
  notes?: string;
  location?: string;
  followUpScheduled?: boolean;
  followUpDate?: Date | null;
  followUpTime?: string;
  followUpNotes?: string;
  nextSteps?: string[];
  agentId?: string;
  agentName?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  contactId?: string;
  title: string;
  description?: string;
  dueDate?: string;
  dueTime?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'completed';
  agentId?: string;
  agentName?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  contactId: string;
  date: string;
  reference?: string;
  items: OrderItem[];
  total: number;
  status: 'draft' | 'confirmed' | 'shipped' | 'delivered' | 'paid' | 'cancelled';
  notes?: string;
  termsAndConditions?: string;
  agentId?: string;
  agentName?: string;
  organizationId?: string;
  vatTotal?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  code: string;
  description: string;
  quantity: number;
  price: number;
  vat?: number;
  subtotal: number;
  product?: Product;
}

export interface Product {
  id: string;
  name?: string;
  code: string;
  description: string;
  price: number;
  cost: number;
  vat?: number;
  caseQuantity?: number;
  firstOrderCommission?: number;
  nextOrdersCommission?: number;
  imageUrl?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  organization_id: string;
  
  // Renamed properties to match the database column names
  company_name?: string;
  company_logo_url?: string;
  companyName?: string;
  companyEmail?: string;
  companyPhone?: string;
  companyAddress?: string;
  
  primary_color?: string;
  secondary_color?: string;
  default_vat_rate?: number;
  defaultVatRate?: number;
  
  terms_enabled?: boolean;
  terms_content?: string;
  terms?: string;
  defaultTermsAndConditions?: string;
  termsEnabled?: boolean;
  
  catalog_url?: string;
  price_list_url?: string;
  catalogUrl?: string;
  priceListUrl?: string;
  
  custom_links?: CustomLink[];
  customLinks?: CustomLink[];
  
  default_contact_email_message?: string;
  defaultContactEmailMessage?: string;
  
  email_footer?: string;
  email_sender_name?: string;
  show_footer_in_emails?: boolean;
  bulk_email_template?: string;
  bulkEmailTemplate?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomLink {
  id?: string;
  name?: string;
  description?: string;
  url: string;
}
