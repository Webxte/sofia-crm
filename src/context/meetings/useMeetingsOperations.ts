
import { useMeetingsFetch } from "./hooks/useMeetingsFetch";
import { useMeetingCRUD } from "./hooks/useMeetingCRUD";
import { useMeetingUtils } from "./hooks/useMeetingUtils";

export const useMeetingsOperations = () => {
  const { meetings, loading, fetchMeetings } = useMeetingsFetch();
  const { createMeeting, addMeeting, updateMeeting, deleteMeeting, loading: loadingCRUD } = useMeetingCRUD();
  const { sendMeetingEmail } = useMeetingUtils();

  const refreshMeetings = async () => {
    await fetchMeetings();
  };

  const addMeetingWithRefresh = async (meetingData: Parameters<typeof addMeeting>[0]) => {
    const result = await addMeeting(meetingData);
    await refreshMeetings();
    return result;
  };

  const updateMeetingWithRefresh = async (id: string, meetingData: Parameters<typeof updateMeeting>[1]) => {
    const result = await updateMeeting(id, meetingData);
    await refreshMeetings();
    return result;
  };

  const deleteMeetingWithRefresh = async (id: string) => {
    const result = await deleteMeeting(id);
    if (result) {
      await refreshMeetings();
    }
    return result;
  };

  const getMeetingById = (id: string) => {
    return meetings.find(meeting => meeting.id === id);
  };

  const getMeetingsByContactId = (contactId: string) => {
    return meetings.filter(meeting => meeting.contactId === contactId);
  };

  const getMeetingsByAgentId = (agentId: string) => {
    return meetings.filter(meeting => meeting.agentId === agentId);
  };

  return {
    meetings,
    loading: loading || loadingCRUD,
    addMeeting: addMeetingWithRefresh,
    updateMeeting: updateMeetingWithRefresh,
    deleteMeeting: deleteMeetingWithRefresh,
    refreshMeetings,
    fetchMeetings,
    getMeetingById,
    getMeetingsByContactId,
    getMeetingsByAgentId,
    sendMeetingEmail,
  };
};
