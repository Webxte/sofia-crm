
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
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface MeetingFormProps {
  contactId?: string;
}

const MeetingForm = ({ contactId }: MeetingFormProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addMeeting, updateMeeting, getMeetingById } = useMeetings();

  const isEdit = Boolean(id);
  const existingMeeting = isEdit ? getMeetingById(id!) : null;

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      contactId: contactId || "",
      type: "meeting",
      date: "",
      time: "",
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
        await addMeeting(meetingData);
        toast({
          title: "Success", 
          description: "Meeting created successfully",
        });
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit Meeting" : "New Meeting"}
        </h1>
        <p className="text-muted-foreground">
          {isEdit ? "Update meeting details" : "Schedule a new meeting with a contact"}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactField form={form} />
            <MeetingTypeField form={form} />
          </div>

          <DateTimeFields form={form} />
          
          <LocationField form={form} />
          
          <NotesField form={form} />

          <div className="flex gap-4">
            <Button type="submit">
              {isEdit ? "Update Meeting" : "Create Meeting"}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/meetings")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MeetingForm;
