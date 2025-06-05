
import { useMeetingsFetch } from "./hooks/useMeetingsFetch";
import { useMeetingCRUD } from "./hooks/useMeetingCRUD";
import { useMeetingUtils } from "./hooks/useMeetingUtils";

export const useMeetingsOperations = () => {
  const { meetings, loading, fetchMeetings } = useMeetingsFetch();
  const { createMeeting, addMeeting, updateMeeting, deleteMeeting, loading: loadingCRUD } = useMeetingCRUD();
  const { getMeetingById, getMeetingsByContactId, getMeetingsByAgentId } = useMeetingUtils();

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

  const sendMeetingEmail = async (meetingId: string, emailData: any): Promise<void> => {
    // Placeholder implementation
    console.log("Send meeting email:", meetingId, emailData);
  };

  return {
    meetings,
    loading: loading || loadingCRUD,
    addMeeting: addMeetingWithRefresh,
    updateMeeting: updateMeetingWithRefresh,
    deleteMeeting: deleteMeetingWithRefresh,
    refreshMeetings,
    fetchMeetings,
    getMeetingById: (id: string) => getMeetingById(meetings, id),
    getMeetingsByContactId: (contactId: string) => getMeetingsByContactId(meetings, contactId),
    getMeetingsByAgentId: (agentId: string) => getMeetingsByAgentId(meetings, agentId),
    sendMeetingEmail,
  };
};
