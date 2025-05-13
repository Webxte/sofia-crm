
import { Meeting } from "@/types";

export interface MeetingsContextType {
  meetings: Meeting[];
  loading: boolean;
  addMeeting: (meeting: Omit<Meeting, "id" | "createdAt" | "updatedAt">, userId?: string, userName?: string) => Promise<Meeting | null>;
  updateMeeting: (id: string, meeting: Partial<Meeting>) => Promise<boolean>;
  deleteMeeting: (id: string) => Promise<boolean>;
  getMeetingById: (id: string) => Meeting | undefined;
  getMeetingsByContactId: (contactId: string) => Meeting[];
  refreshMeetings: (isAuthenticated?: boolean) => Promise<Meeting[]>;
}
