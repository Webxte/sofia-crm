// Contact types
export interface Contact {
  id: string;
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  notes?: string;
  position?: string;
  agentId?: string;
  agentName?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Meeting types
export interface Meeting {
  id: string;
  contactId: string;
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
  agentId?: string;
  agentName?: string;
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
  vat?: number; // Adding VAT field
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
  vat?: number; // Adding VAT field
  subtotal: number;
  product: Product;
}

export interface Order {
  id: string;
  contactId: string;
  agentId?: string; // Adding agent ID
  agentName?: string; // Adding agent name
  date: Date;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
  items: OrderItem[];
  total: number;
  vatTotal?: number; // Adding VAT total
  notes?: string;
  termsAndConditions?: string; // Adding terms and conditions
  reference?: string; // Adding reference/order number
  createdAt: Date;
  updatedAt: Date;
}

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
}

// Settings types
export interface Settings {
  id: string;
  defaultTermsAndConditions: string;
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  defaultVatRate: number;
}
