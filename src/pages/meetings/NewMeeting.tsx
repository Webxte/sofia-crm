
import { useLocation } from "react-router-dom";
import MeetingForm from "@/components/meetings/MeetingForm";
import { Helmet } from "react-helmet-async";

const NewMeeting = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  return (
    <>
      <Helmet>
        <title>Add Meeting | CRM</title>
      </Helmet>
      <MeetingForm contactId={contactId || undefined} />
    </>
  );
};

export default NewMeeting;
