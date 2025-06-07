
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMeetings } from "@/context/meetings";
import { ContactField } from "./fields/ContactField";
import { MeetingTypeField } from "./fields/MeetingTypeField";
import { DateTimeFields } from "./fields/DateTimeFields";
import { LocationField } from "./fields/LocationField";
import { NotesField } from "./fields/NotesField";
import { meetingSchema, type MeetingFormData } from "./validation/meetingSchema";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { MeetingFormHeader } from "./form/MeetingFormHeader";
import { FollowUpSection } from "./form/FollowUpSection";
import { MeetingFormActions } from "./form/MeetingFormActions";

interface MeetingFormProps {
  contactId?: string;
}

const MeetingForm = ({ contactId }: MeetingFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addMeeting, updateMeeting, getMeetingById } = useMeetings();
  const [followUpData, setFollowUpData] = useState({
    schedule: false,
    date: "",
    time: "",
  });

  const isEdit = Boolean(id);
  const existingMeeting = isEdit ? getMeetingById(id!) : null;

  // Get current date and time
  const now = new Date();
  const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      contactId: contactId || "",
      type: "meeting",
      date: currentDate, // Default to today
      time: currentTime, // Default to current time
      location: "",
      notes: "",
      nextSteps: [],
    },
  });

  useEffect(() => {
    if (existingMeeting) {
      form.reset({
        contactId: existingMeeting.contactId,
        type: existingMeeting.type,
        date: existingMeeting.date,
        time: existingMeeting.time,
        location: existingMeeting.location || "",
        notes: existingMeeting.notes || "",
        nextSteps: existingMeeting.nextSteps || [],
      });
    }
  }, [existingMeeting, form]);

  const onSubmit = async (data: MeetingFormData) => {
    try {
      // Ensure contactId is provided
      if (!data.contactId) {
        toast({
          title: "Error",
          description: "Please select a contact",
          variant: "destructive",
        });
        return;
      }

      const meetingData = {
        contactId: data.contactId,
        type: data.type,
        date: data.date,
        time: data.time,
        location: data.location || "",
        notes: data.notes || "",
        nextSteps: data.nextSteps || [],
        agentId: user?.id || '',
        agentName: user?.user_metadata?.name || user?.email || 'Unknown Agent',
      };

      if (isEdit && id) {
        await updateMeeting(id, meetingData);
        toast({
          title: "Success",
          description: "Meeting updated successfully",
        });
      } else {
        // Create the main meeting
        await addMeeting(meetingData);
        
        // Only create follow-up if scheduled and has valid date/time
        if (followUpData.schedule && followUpData.date && followUpData.time) {
          const followUpMeetingData = {
            ...meetingData,
            date: followUpData.date,
            time: followUpData.time,
            notes: `Follow-up meeting from ${data.date}`,
          };
          await addMeeting(followUpMeetingData);
          toast({
            title: "Success",
            description: "Meeting and follow-up meeting created successfully",
          });
        } else {
          toast({
            title: "Success", 
            description: "Meeting created successfully",
          });
        }
      }
      
      navigate("/meetings");
    } catch (error) {
      console.error("Error saving meeting:", error);
      toast({
        title: "Error",
        description: "Failed to save meeting. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <MeetingFormHeader isEdit={isEdit} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactField form={form} />
            <MeetingTypeField form={form} />
          </div>

          <DateTimeFields form={form} />
          
          <LocationField form={form} />
          
          <NotesField form={form} />

          <FollowUpSection
            isEdit={isEdit}
            onFollowUpChange={setFollowUpData}
          />

          <MeetingFormActions isEdit={isEdit} />
        </form>
      </Form>
    </div>
  );
};

export default MeetingForm;
