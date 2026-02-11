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
  role: "owner" | "admin" | "member" | "manager" | "guest";
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
  category?: string;
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
  contactName?: string;
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
  
  // Use consistent naming - we'll make both snake_case and camelCase versions available
  company_name: string;
  companyName: string;
  company_email?: string;
  companyEmail?: string;
  company_phone?: string;
  companyPhone?: string;
  company_address?: string;
  companyAddress?: string;
  
  primary_color?: string;
  secondary_color?: string;
  default_vat_rate?: number;
  defaultVatRate?: number;
  
  terms_enabled?: boolean;
  termsEnabled?: boolean;
  terms?: string;
  default_terms_and_conditions?: string;
  defaultTermsAndConditions?: string;
  
  catalog_url?: string;
  catalogUrl?: string;
  price_list_url?: string;
  priceListUrl?: string;
  
  custom_links?: CustomLink[];
  customLinks?: CustomLink[];
  
  bulk_email_template?: string;
  bulkEmailTemplate?: string;
  
  default_contact_email_message?: string;
  defaultContactEmailMessage?: string;
  
  default_email_subject?: string;
  defaultEmailSubject?: string;
  
  default_email_message?: string;
  defaultEmailMessage?: string;
  
  email_footer?: string;
  emailFooter?: string;
  
  email_sender_name?: string;
  emailSenderName?: string;
  
  show_footer_in_emails?: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomLink {
  id?: string;
  name?: string;
  description?: string;
  url: string;
}
