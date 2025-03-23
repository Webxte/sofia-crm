
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MeetingFormValues } from "../validation/meetingSchema";

interface NotesFieldProps {
  form: UseFormReturn<MeetingFormValues>;
}

export const NotesField = ({ form }: NotesFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="notes"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Meeting Notes *</FormLabel>
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
  );
};
