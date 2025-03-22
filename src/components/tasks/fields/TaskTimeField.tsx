
import { ControllerRenderProps } from "react-hook-form";
import { Clock } from "lucide-react";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface TaskTimeFieldProps {
  field: ControllerRenderProps<any, "dueTime">;
}

export const TaskTimeField = ({ field }: TaskTimeFieldProps) => {
  return (
    <FormItem>
      <FormLabel>Due Time</FormLabel>
      <div className="relative">
        <FormControl>
          <Input type="time" {...field} />
        </FormControl>
        <Clock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
      </div>
      <FormMessage />
    </FormItem>
  );
};
