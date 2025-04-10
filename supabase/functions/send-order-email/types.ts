
export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  code: string;
  description: string;
  quantity: number;
  price: number;
  subtotal: number;
  vat?: number;
}

export interface Order {
  id: string;
  contact_id: string;
  reference?: string;
  date: string;
  total: number;
  vat_total?: number;
  status: string;
  notes?: string;
  terms_and_conditions?: string;
  agent_id?: string;
  agent_name?: string;
  order_items: OrderItem[];
}

export interface Contact {
  id: string;
  fullName?: string;
  email?: string;
  company?: string;
  phone?: string;
  source?: string;
}

export interface Settings {
  email_sender_name?: string;
  email_footer?: string;
  show_footer_in_emails?: boolean;
}

export interface OrderEmailRequest {
  orderId: string;
  recipient: string;
  subject: string;
  message: string;
  includeOrderDetails?: boolean;
  cc?: string[];
}
