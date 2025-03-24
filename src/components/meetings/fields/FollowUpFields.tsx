import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { FollowUpTimeField } from "./FollowUpTimeField";

export const FollowUpFields = ({ form }: any) => {
  const [followUpScheduled, setFollowUpScheduled] = useState(form.watch("followUpScheduled"));

  return (
    <div>
      <FormField
        control={form.control}
        name="followUpScheduled"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Schedule Follow-up?</FormLabel>
              <FormDescription>
                Enable this if you want to schedule a follow-up for this meeting.
              </FormDescription>
            </div>
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  setFollowUpScheduled(checked);
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />

      {form.watch("followUpScheduled") && (
        <div className="space-y-4 mt-4">
          <FollowUpTimeField form={form} />

          <FormField
            control={form.control}
            name="followUpNotes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Notes</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Add any notes for the follow-up"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Add any notes for the follow-up.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}
    </div>
  );
};
