
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MeetingFormValues } from "../validation/meetingSchema";

interface LocationFieldProps {
  form: UseFormReturn<MeetingFormValues>;
}

export const LocationField = ({ form }: LocationFieldProps) => {
  const meetingType = form.watch("type");
  
  // Generate placeholder text based on meeting type
  const getPlaceholder = () => {
    switch (meetingType) {
      case "meeting":
        return "Meeting address or venue";
      case "online":
        return "Zoom/Teams/Google Meet link";
      case "phone":
        return "Phone number or call details";
      case "email":
        return "Optional notes about the email";
      default:
        return "Location details";
    }
  };

  return (
    <FormField
      control={form.control}
      name="location"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Location {meetingType !== "meeting" && meetingType !== "online" ? "(Optional)" : ""}</FormLabel>
          <FormControl>
            <Input placeholder={getPlaceholder()} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
