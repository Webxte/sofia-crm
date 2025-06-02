
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Meeting } from "@/types";
import { useMeetings } from "@/context/meetings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { ArrowLeft } from "lucide-react";
import { meetingSchema, MeetingFormValues } from "./validation/meetingSchema";
import { ContactField } from "./fields/ContactField";
import { MeetingTypeField } from "./fields/MeetingTypeField";
import { DateTimeFields } from "./fields/DateTimeFields";
import { LocationField } from "./fields/LocationField";
import { NotesField } from "./fields/NotesField";
import { FollowUpFields } from "./fields/FollowUpFields";

interface MeetingFormProps {
  meeting?: Meeting;
  isEditing?: boolean;
  contactId?: string;
}

const MeetingForm = ({ meeting, isEditing = false, contactId }: MeetingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addMeeting, updateMeeting } = useMeetings();
  const { toast } = useToast();
  const navigate = useNavigate();

  const defaultValues: Partial<MeetingFormValues> = {
    contactId: contactId || meeting?.contactId || "",
    type: meeting?.type || "meeting",
    date: meeting?.date ? new Date(meeting.date) : new Date(),
    time: meeting?.time || format(new Date(), "HH:mm"),
    location: meeting?.location || "",
    notes: meeting?.notes || "",
    followUpScheduled: meeting?.followUpScheduled || false,
    followUpDate: meeting?.followUpDate || "", // Keep as string
    followUpTime: meeting?.followUpTime || format(new Date(), "HH:mm"),
    nextSteps: meeting?.nextSteps || [],
  };

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues,
  });

  const onSubmit = async (data: MeetingFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Create complete object with all required properties
      const meetingData: Omit<Meeting, "id" | "createdAt" | "updatedAt"> = {
        contactId: data.contactId,
        type: data.type,
        date: data.date.toISOString().split('T')[0], // Convert Date to ISO date string
        time: data.time,
        notes: data.notes,
        location: data.location || "",
        followUpScheduled: data.followUpScheduled,
        followUpDate: data.followUpScheduled && data.followUpDate ? data.followUpDate : undefined, // Keep as string
        followUpTime: data.followUpScheduled ? data.followUpTime || "" : "",
        followUpNotes: data.followUpScheduled ? data.followUpNotes || "" : "",
        nextSteps: data.nextSteps || [],
        organizationId: "", // This will be set by the backend
        contactName: "",
        agentId: "",
        agentName: ""
      };
      
      if (isEditing && meeting) {
        await updateMeeting(meeting.id, meetingData);
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
      console.error(error);
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate("/meetings")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Meeting" : "Add Meeting"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ContactField form={form} disabled={!!contactId} />
            <MeetingTypeField form={form} />
            <DateTimeFields form={form} />
          </div>

          <LocationField form={form} />
          <NotesField form={form} />
          <FollowUpFields form={form} />

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/meetings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              {isSubmitting ? "Saving..." : isEditing ? "Update Meeting" : "Add Meeting"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MeetingForm;
