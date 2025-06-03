
import { useMeetingsFetch } from "./hooks/useMeetingsFetch";
import { useMeetingCRUD } from "./hooks/useMeetingCRUD";
import { useMeetingUtils } from "./hooks/useMeetingUtils";

export const useMeetingsOperations = () => {
  const { meetings, setMeetings, loading, fetchMeetings } = useMeetingsFetch();
  const { addMeeting: addMeetingBase, updateMeeting: updateMeetingBase, deleteMeeting: deleteMeetingBase, sendMeetingEmail } = useMeetingCRUD();
  const { getMeetingById: getMeetingByIdBase, getMeetingsByContactId: getMeetingsByContactIdBase, getMeetingsByAgentId: getMeetingsByAgentIdBase } = useMeetingUtils();

  // Wrap CRUD operations to refresh data
  const addMeeting = async (meetingData: Parameters<typeof addMeetingBase>[0]) => {
    const result = await addMeetingBase(meetingData);
    await fetchMeetings(); // Refresh meetings after adding
    return result;
  };

  const updateMeeting = async (id: string, meetingData: Parameters<typeof updateMeetingBase>[1]) => {
    const result = await updateMeetingBase(id, meetingData);
    await fetchMeetings(); // Refresh meetings after updating
    return result;
  };

  const deleteMeeting = async (id: string) => {
    const result = await deleteMeetingBase(id);
    if (result) {
      await fetchMeetings(); // Refresh meetings after deleting
    }
    return result;
  };

  const refreshMeetings = async () => {
    await fetchMeetings();
  };

  // Utility methods with meetings passed in
  const getMeetingById = (id: string) => getMeetingByIdBase(meetings, id);
  const getMeetingsByContactId = (contactId: string) => getMeetingsByContactIdBase(meetings, contactId);
  const getMeetingsByAgentId = (agentId: string) => getMeetingsByAgentIdBase(meetings, agentId);

  return {
    meetings,
    loading,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    refreshMeetings,
    fetchMeetings,
    getMeetingById,
    getMeetingsByContactId,
    getMeetingsByAgentId,
    sendMeetingEmail,
  };
};
