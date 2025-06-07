
import { useParams, Navigate } from "react-router-dom";
import { useMeetings } from "@/context/meetings";
import MeetingForm from "@/components/meetings/MeetingForm";

const EditMeeting = () => {
  const { id } = useParams();
  const { getMeetingById } = useMeetings();
  
  const meeting = id ? getMeetingById(id) : undefined;
  
  if (!meeting) {
    return <Navigate to="/meetings" replace />;
  }
  
  return <MeetingForm />;
};

export default EditMeeting;
