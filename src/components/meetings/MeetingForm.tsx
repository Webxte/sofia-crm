
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Meeting } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import { useMeetings } from "@/context/MeetingsContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ArrowLeft, Calendar as CalendarIcon, Clock } from "lucide-react";

// Define the schema for meeting validation
const meetingSchema = z.object({
  contactId: z.string({
    required_error: "Contact is required",
  }),
  type: z.enum(["meeting", "phone", "email", "other"], {
    required_error: "Meeting type is required",
  }),
  date: z.date({
    required_error: "Date is required",
  }),
  time: z.string({
    required_error: "Time is required",
  }),
  location: z.string().optional(),
  notes: z.string({
    required_error: "Meeting notes are required",
  }),
  followUpScheduled: z.boolean().default(false),
  followUpDate: z.date().optional(),
  nextSteps: z.array(z.string()).optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  meeting?: Meeting;
  isEditing?: boolean;
  contactId?: string;
}

const MeetingForm = ({ meeting, isEditing = false, contactId }: MeetingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { contacts } = useContacts();
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
    followUpDate: meeting?.followUpDate ? new Date(meeting.followUpDate) : undefined,
    nextSteps: meeting?.nextSteps || [],
  };

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues,
  });

  const followUpScheduled = form.watch("followUpScheduled");

  const onSubmit = async (data: MeetingFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (isEditing && meeting) {
        updateMeeting(meeting.id, data);
        toast({
          title: "Success",
          description: "Meeting updated successfully",
        });
      } else {
        addMeeting(data);
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
          {isEditing ? "Edit Meeting" : "Schedule Meeting"}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="contactId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                    disabled={!!contactId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a contact" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.fullName || contact.company || "Unnamed Contact"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="meeting">In-person Meeting</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Meeting location" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Meeting Notes</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What was discussed?" 
                    className="min-h-32" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followUpScheduled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 mt-1 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Schedule Follow-up</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    Set a reminder for follow-up activities
                  </p>
                </div>
              </FormItem>
            )}
          />

          {followUpScheduled && (
            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Follow-up Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <div className="flex justify-end gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate("/meetings")}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : isEditing ? "Update Meeting" : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default MeetingForm;
