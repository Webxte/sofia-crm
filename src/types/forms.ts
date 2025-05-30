
// Form-specific types and validation schemas

import { z } from "zod";

// Base form types
export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "date" | "time" | "number";
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: z.ZodSchema;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSection {
  title: string;
  description?: string;
  fields: FormField[];
}

export interface FormConfig {
  title: string;
  description?: string;
  sections: FormSection[];
  submitLabel?: string;
  cancelLabel?: string;
}

// Validation schemas using Zod
export const contactFormSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100, "Name too long"),
  company: z.string().max(100, "Company name too long").optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number too long").optional(),
  mobile: z.string().max(20, "Mobile number too long").optional(),
  position: z.string().max(100, "Position too long").optional(),
  address: z.string().max(500, "Address too long").optional(),
  source: z.string().max(100, "Source too long").optional(),
  notes: z.string().max(1000, "Notes too long").optional(),
});

export const meetingFormSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  type: z.enum(["meeting", "phone", "email", "online", "other"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().max(200, "Location too long").optional(),
  notes: z.string().min(1, "Notes are required").max(1000, "Notes too long"),
  followUpScheduled: z.boolean(),
  followUpDate: z.string().optional(),
  followUpTime: z.string().optional(),
  followUpNotes: z.string().max(1000, "Follow-up notes too long").optional(),
  nextSteps: z.array(z.string()).optional(),
});

export const taskFormSchema = z.object({
  contactId: z.string().optional(),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(1000, "Description too long").optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  status: z.enum(["active", "completed"]),
});

export const orderFormSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  date: z.string().min(1, "Date is required"),
  reference: z.string().max(50, "Reference too long").optional(),
  status: z.enum(["draft", "confirmed", "shipped", "delivered", "paid", "cancelled"]),
  notes: z.string().max(1000, "Notes too long").optional(),
  termsAndConditions: z.string().max(2000, "Terms too long").optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "Product is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    price: z.number().min(0, "Price must be positive").optional(),
    vat: z.number().min(0, "VAT must be positive").optional(),
  })).min(1, "At least one item is required"),
});

export const productFormSchema = z.object({
  code: z.string().min(1, "Code is required").max(50, "Code too long"),
  description: z.string().min(1, "Description is required").max(500, "Description too long"),
  price: z.number().min(0, "Price must be positive"),
  cost: z.number().min(0, "Cost must be positive"),
  vat: z.number().min(0, "VAT must be positive").optional(),
  caseQuantity: z.number().min(1, "Case quantity must be at least 1").optional(),
  firstOrderCommission: z.number().min(0, "Commission must be positive").optional(),
  nextOrdersCommission: z.number().min(0, "Commission must be positive").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const organizationFormSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Name too long"),
  slug: z.string().min(1, "Slug is required").max(50, "Slug too long")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  logoUrl: z.string().url("Invalid logo URL").optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  password: z.string().min(6, "Password must be at least 6 characters").optional(),
});

export const settingsFormSchema = z.object({
  companyName: z.string().max(100, "Company name too long").optional(),
  companyEmail: z.string().email("Invalid email").optional(),
  companyPhone: z.string().max(20, "Phone number too long").optional(),
  companyAddress: z.string().max(500, "Address too long").optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format").optional(),
  defaultVatRate: z.number().min(0, "VAT rate must be positive").max(100, "VAT rate too high"),
  termsEnabled: z.boolean(),
  terms: z.string().max(5000, "Terms too long").optional(),
  defaultTermsAndConditions: z.string().max(2000, "Terms too long").optional(),
  catalogUrl: z.string().url("Invalid catalog URL").optional(),
  priceListUrl: z.string().url("Invalid price list URL").optional(),
  bulkEmailTemplate: z.string().max(2000, "Template too long").optional(),
  defaultContactEmailMessage: z.string().max(1000, "Message too long").optional(),
  defaultEmailSubject: z.string().max(200, "Subject too long").optional(),
  defaultEmailMessage: z.string().max(1000, "Message too long").optional(),
  emailFooter: z.string().max(500, "Footer too long"),
  emailSenderName: z.string().max(100, "Sender name too long"),
  showFooterInEmails: z.boolean(),
});

export const memberInviteFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["owner", "admin", "manager", "member", "guest"]),
});

export const loginFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
  role: z.enum(["admin", "agent"]).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const changePasswordFormSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your new password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const emailFormSchema = z.object({
  to: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required").max(200, "Subject too long"),
  body: z.string().min(1, "Message is required").max(5000, "Message too long"),
  attachments: z.array(z.object({
    name: z.string(),
    content: z.string(),
    type: z.string(),
  })).optional(),
});

export const customLinkFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long"),
  url: z.string().url("Invalid URL"),
});

// Form state types
export interface FormState<T> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormActions<T> {
  setValue: (name: keyof T, value: any) => void;
  setError: (name: keyof T, error: string) => void;
  setTouched: (name: keyof T, touched: boolean) => void;
  reset: () => void;
  submit: () => Promise<void>;
}

// Form field types for dynamic forms
export interface DynamicFormField extends FormField {
  id: string;
  section?: string;
  order: number;
  defaultValue?: any;
  conditional?: {
    field: string;
    value: any;
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than";
  };
}

export interface DynamicFormSchema {
  id: string;
  name: string;
  description?: string;
  version: number;
  fields: DynamicFormField[];
  validation?: z.ZodSchema;
  metadata?: Record<string, any>;
}

// Form submission types
export interface FormSubmission<T = any> {
  id: string;
  formId: string;
  data: T;
  submittedBy: string;
  submittedAt: Date;
  status: "pending" | "processed" | "failed";
  metadata?: Record<string, any>;
}

// Type inference helpers
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type MeetingFormData = z.infer<typeof meetingFormSchema>;
export type TaskFormData = z.infer<typeof taskFormSchema>;
export type OrderFormData = z.infer<typeof orderFormSchema>;
export type ProductFormData = z.infer<typeof productFormSchema>;
export type OrganizationFormData = z.infer<typeof organizationFormSchema>;
export type SettingsFormData = z.infer<typeof settingsFormSchema>;
export type MemberInviteFormData = z.infer<typeof memberInviteFormSchema>;
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type SignupFormData = z.infer<typeof signupFormSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordFormSchema>;
export type EmailFormData = z.infer<typeof emailFormSchema>;
export type CustomLinkFormData = z.infer<typeof customLinkFormSchema>;
