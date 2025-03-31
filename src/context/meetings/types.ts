
import { Meeting } from "@/types";

export interface MeetingsContextType {
  meetings: Meeting[];
  loading: boolean;
  addMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  getMeetingById: (id: string) => Meeting | undefined;
  getMeetingsByContactId: (contactId: string) => Meeting[];
  refreshMeetings: () => Promise<void>;
}
