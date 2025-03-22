
import { useLocation } from "react-router-dom";
import MeetingForm from "@/components/meetings/MeetingForm";

const NewMeeting = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  return <MeetingForm contactId={contactId || undefined} />;
};

export default NewMeeting;
