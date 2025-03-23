
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MeetingFormValues } from "../validation/meetingSchema";

interface LocationFieldProps {
  form: UseFormReturn<MeetingFormValues>;
}

export const LocationField = ({ form }: LocationFieldProps) => {
  return (
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
  );
};
