
import { Settings } from "@/types";

export const DEFAULT_SETTINGS: Settings = {
  id: "",
  organization_id: "",
  company_name: "CRM System",
  companyName: "CRM System",
  companyEmail: "",
  company_email: "",
  companyPhone: "",
  company_phone: "",
  companyAddress: "",
  company_address: "",
  terms: "", 
  termsEnabled: false,
  terms_enabled: false,
  defaultTermsAndConditions: "",
  default_terms_and_conditions: "",
  custom_links: [],
  customLinks: [],
  email_footer: "This is an automated message from your CRM system.",
  emailFooter: "This is an automated message from your CRM system.",
  email_sender_name: "CRM System",
  emailSenderName: "CRM System",
  default_vat_rate: 0,
  defaultVatRate: 0,
  default_email_subject: "Order Confirmation - Ref: [Reference]",
  defaultEmailSubject: "Order Confirmation - Ref: [Reference]",
  default_email_message: "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
  defaultEmailMessage: "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
  createdAt: new Date(),
  updatedAt: new Date()
};
