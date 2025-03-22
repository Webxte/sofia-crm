
import { ControllerRenderProps } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionFieldProps {
  field: ControllerRenderProps<any, "description">;
}

export const TaskDescriptionField = ({ field }: TaskDescriptionFieldProps) => {
  return (
    <FormItem>
      <FormLabel>Description (Optional)</FormLabel>
      <FormControl>
        <Textarea 
          placeholder="Add more details about this task..." 
          className="min-h-32" 
          {...field} 
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
