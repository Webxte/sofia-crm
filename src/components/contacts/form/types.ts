
import { z } from "zod";
import { Contact } from "@/types";

export const contactFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  company: z.string().optional(),
  position: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export interface ContactFormProps {
  initialData?: Partial<ContactFormValues>;
  contact?: Contact;
  isEditing?: boolean;
}
