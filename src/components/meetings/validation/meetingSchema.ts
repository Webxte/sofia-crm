
import { z } from "zod";

export const meetingSchema = z.object({
  contactId: z.string().min(1, "Contact is required"),
  type: z.enum(["meeting", "phone", "email", "online", "other"]),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  location: z.string().optional(),
  notes: z.string().optional(),
  nextSteps: z.array(z.string()).optional().default([]),
});

export type MeetingFormData = z.infer<typeof meetingSchema>;
