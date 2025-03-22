
import { ControllerRenderProps } from "react-hook-form";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface TaskTitleFieldProps {
  field: ControllerRenderProps<any, "title">;
}

export const TaskTitleField = ({ field }: TaskTitleFieldProps) => {
  return (
    <FormItem>
      <FormLabel>Task Title</FormLabel>
      <FormControl>
        <Input placeholder="What needs to be done?" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
