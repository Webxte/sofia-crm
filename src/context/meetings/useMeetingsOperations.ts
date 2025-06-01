
import { useMeetingsFetch } from "./hooks/useMeetingsFetch";
import { useMeetingCRUD } from "./hooks/useMeetingCRUD";
import { useMeetingUtils } from "./hooks/useMeetingUtils";

export const useMeetingsOperations = () => {
  const { meetings, setMeetings, loading, fetchMeetings } = useMeetingsFetch();
  const { addMeeting: addMeetingBase, updateMeeting: updateMeetingBase, deleteMeeting: deleteMeetingBase, sendMeetingEmail } = useMeetingCRUD();
  const { getMeetingById: getMeetingByIdBase, getMeetingsByContactId: getMeetingsByContactIdBase, getMeetingsByAgentId: getMeetingsByAgentIdBase } = useMeetingUtils();

  // Wrap CRUD operations to pass setMeetings
  const addMeeting = (meetingData: Parameters<typeof addMeetingBase>[0]) => 
    addMeetingBase(meetingData, setMeetings);

  const updateMeeting = (id: string, meetingData: Parameters<typeof updateMeetingBase>[1]) => 
    updateMeetingBase(id, meetingData, setMeetings);

  const deleteMeeting = (id: string) => 
    deleteMeetingBase(id, setMeetings);

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
