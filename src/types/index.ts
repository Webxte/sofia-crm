
export type UserRole = "admin" | "agent";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Contact {
  id: string;
  fullName?: string;
  company?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  address?: string;
  position?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Meeting {
  id: string;
  contactId: string;
  date: Date;
  time: string;
  location?: string;
  notes: string;
  nextSteps?: string[];
  followUpScheduled?: boolean;
  followUpDate?: Date;
  type: "meeting" | "phone" | "email" | "other";
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  contactId?: string;
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  code: string;
  description: string;
  price: number;
  cost: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  contactId: string;
  date: Date;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  total: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
