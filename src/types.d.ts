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
  type: string;
  notes?: string;
  location?: string;
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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  notes?: string;
  agentId?: string;
  agentName?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  organization_id: string;
  company_name?: string;
  company_logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
  default_vat_rate?: number;
  terms_enabled?: boolean;
  terms_content?: string;
  catalog_url?: string;
  price_list_url?: string;
  custom_links?: CustomLink[];
  default_contact_email_message?: string;
  email_footer?: string;
  email_sender_name?: string;
  show_footer_in_emails?: boolean;
  bulk_email_template?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomLink {
  id: string;
  name: string;
  url: string;
}
