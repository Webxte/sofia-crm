
export interface Contact {
  id: string;
  fullName: string;
  company: string;
  email: string;
  phone: string;
  mobile: string;
  position: string;
  address: string;
  source: string;
  category: string;
  notes: string;
  agentId: string;
  agentName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  contactId: string;
  contactName: string;
  type: "meeting" | "phone" | "email" | "online" | "other";
  date: string;
  time: string;
  location: string;
  notes: string;
  nextSteps: string[];
  agentId: string;
  agentName: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "active" | "completed";
  dueDate?: string;
  dueTime?: string;
  contactId?: string;
  agentId: string;
  agentName: string;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  createdAt: Date;
  updatedAt: Date;
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  code: string;
  description: string;
  price: number;
  quantity: number;
  vat?: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  contactId: string;
  contactCompany?: string | null;
  contactFullName?: string | null;
  agentId: string;
  agentName: string;
  date: string;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
  items: OrderItem[];
  total: number;
  vatTotal?: number;
  notes?: string;
  termsAndConditions?: string;
  reference?: string;
  paymentDate?: string | null;
  paymentMethod?: string | null;
  invoiceNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settings {
  id: string;
  userId: string;
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  defaultEmailSubject: string;
  defaultEmailMessage: string;
  defaultContactEmailMessage: string;
  defaultTermsAndConditions: string;
  customLinks: CustomLink[];
  catalogUrl: string;
  priceListUrl: string;
  emailFooter: string;
  emailSenderName: string;
  termsEnabled: boolean;
  defaultVatRate: number;
  bulkEmailTemplate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomLink {
  id?: string;
  name?: string;
  description?: string;
  url: string;
}
