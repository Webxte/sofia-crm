
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MeetingFormValues } from "../validation/meetingSchema";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface FollowUpFieldsProps {
  form: UseFormReturn<MeetingFormValues>;
}

export const FollowUpFields = ({ form }: FollowUpFieldsProps) => {
  const followUpScheduled = form.watch("followUpScheduled");

  return (
    <>
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
        <>
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
                      selected={field.value || undefined}
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
            name="followUpTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Time</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input type="time" {...field} value={field.value || ""} />
                  </FormControl>
                  <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followUpNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Notes for follow-up" 
                    className="min-h-20" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};
