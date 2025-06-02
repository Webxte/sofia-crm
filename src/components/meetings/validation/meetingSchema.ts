
import { z } from "zod";

export const meetingSchema = z.object({
  contactId: z.string({
    required_error: "Contact is required",
  }),
  type: z.enum(["meeting", "phone", "email", "online", "other"], {
    required_error: "Meeting type is required",
  }),
  date: z.date({
    required_error: "Date is required",
  }),
  time: z.string({
    required_error: "Time is required",
  }),
  location: z.string().optional(),
  notes: z.string({
    required_error: "Meeting notes are required",
  }).min(1, "Meeting notes are required"),
  nextSteps: z.array(z.string()).optional(),
});

export type MeetingFormValues = z.infer<typeof meetingSchema>;
