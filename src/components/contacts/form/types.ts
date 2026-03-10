
import { z } from "zod";
import { Contact } from "@/types";

export const CONTACT_CATEGORIES = [
  "Butchers",
  "Coffee Shops",
  "Distributor",
  "Fishmongers",
  "Fruit & Vegetable",
  "Grocery Shop",
  "Market Trader",
  "Off Licence",
  "Refill Shops",
  "Restaurants",
  "Other",
] as const;

export const contactFormSchema = z.object({
  fullName: z.string().optional(),
  company: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')).nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).refine((data) => {
  // Either fullName or company must be provided
  return !!data.fullName || !!data.company;
}, {
  message: "Either Full Name or Company must be provided",
  path: ["fullName"] // Error will be shown on the fullName field
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactFormProps {
  initialData?: Partial<ContactFormValues>;
  contact?: Contact;
  isEditing?: boolean;
  onContactCreated?: (contact: Contact) => void;
}
