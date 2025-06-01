
import { Meeting } from "@/types";

export const useMeetingUtils = () => {
  const getMeetingById = (meetings: Meeting[], id: string): Meeting | undefined => {
    return meetings.find(meeting => meeting.id === id);
  };

  const getMeetingsByContactId = (meetings: Meeting[], contactId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.contactId === contactId);
  };

  const getMeetingsByAgentId = (meetings: Meeting[], agentId: string): Meeting[] => {
    return meetings.filter(meeting => meeting.agentId === agentId);
  };

  return {
    getMeetingById,
    getMeetingsByContactId,
    getMeetingsByAgentId,
  };
};
