
import { z } from "zod";

export const emailFormSchema = z.object({
  recipient: z.string().email({ message: "Please enter a valid email address" }),
  cc: z.string().optional().refine(val => !val || val.split(',').every(email => email.trim().match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)), {
    message: "Please enter valid email addresses separated by commas"
  }),
  subject: z.string().min(1, { message: "Subject is required" }),
  message: z.string().min(1, { message: "Message is required" }),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;
