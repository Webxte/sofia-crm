
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
  createdAt: Date;
  updatedAt: Date;
}

// Meeting types
export interface Meeting {
  id: string;
  contactId: string;
  type: "meeting" | "phone" | "email" | "other";
  date: Date;
  time: string;
  location?: string;
  notes: string;
  followUpScheduled: boolean;
  followUpDate?: Date | null;
  followUpNotes?: string;
  nextSteps?: string[];
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
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface OrderItem {
  productId: string;
  code: string;
  description: string;
  price: number;
  quantity: number;
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

// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent";
}
