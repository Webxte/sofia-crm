
import { Meeting } from "@/types";

export interface MeetingsContextType {
  meetings: Meeting[];
  loading: boolean;
  addMeeting: (meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => Promise<Meeting | null>;
  updateMeeting: (id: string, meetingData: Partial<Meeting>) => Promise<Meeting | null>;
  deleteMeeting: (id: string) => Promise<boolean>;
  getMeetingById: (id: string) => Meeting | undefined;
  getMeetingsByContactId: (contactId: string) => Meeting[];
  getMeetingsByAgentId: (agentId: string) => Meeting[];
  refreshMeetings: () => Promise<void>;
  sendMeetingEmail: (meetingId: string, emailData: any) => Promise<boolean>;
}
