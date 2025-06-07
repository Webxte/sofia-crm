
import { useMeetingsFetch } from "./hooks/useMeetingsFetch";
import { useMeetingCRUD } from "./hooks/useMeetingCRUD";
import { useMeetingUtils } from "./hooks/useMeetingUtils";

export const useMeetingsOperations = () => {
  const { meetings, setMeetings, loading, fetchMeetings } = useMeetingsFetch();
  const { createMeeting, addMeeting, updateMeeting, deleteMeeting, loading: loadingCRUD } = useMeetingCRUD();
  const { getMeetingById, getMeetingsByContactId, getMeetingsByAgentId } = useMeetingUtils();

  const refreshMeetings = async () => {
    await fetchMeetings();
  };

  const addMeetingWithRefresh = async (meetingData: Parameters<typeof addMeeting>[0]) => {
    console.log("useMeetingsOperations: Adding meeting with data:", meetingData);
    const result = await addMeeting(meetingData);
    console.log("useMeetingsOperations: Meeting added, refreshing list");
    await refreshMeetings();
    return result;
  };

  const updateMeetingWithRefresh = async (id: string, meetingData: Parameters<typeof updateMeeting>[1]) => {
    console.log("useMeetingsOperations: Updating meeting:", id);
    const result = await updateMeeting(id, meetingData);
    console.log("useMeetingsOperations: Meeting updated, refreshing list");
    await refreshMeetings();
    return result;
  };

  const deleteMeetingWithRefresh = async (id: string) => {
    console.log("useMeetingsOperations: Deleting meeting:", id);
    const result = await deleteMeeting(id);
    if (result) {
      console.log("useMeetingsOperations: Meeting deleted, refreshing list");
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
    setMeetings,
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
