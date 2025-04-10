
import { Settings } from "@/types";

export const DEFAULT_SETTINGS: Settings = {
  companyName: "CRM System",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  terms: "", // Changed from defaultTermsAndConditions
  termsEnabled: false,
  customLinks: [],
  emailFooter: "This is an automated message from your CRM system.",
  emailSenderName: "CRM System",
  defaultVatRate: 0,
  defaultEmailSubject: "Order Confirmation - Ref: [Reference]",
  defaultEmailMessage: "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business."
};
