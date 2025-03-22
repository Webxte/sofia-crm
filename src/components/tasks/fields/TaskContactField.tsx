
import { ControllerRenderProps } from "react-hook-form";
import { useContacts } from "@/context/ContactsContext";
import {
  FormControl,
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

interface TaskContactFieldProps {
  field: ControllerRenderProps<any, "contactId">;
  disabled?: boolean;
}

export const TaskContactField = ({ field, disabled = false }: TaskContactFieldProps) => {
  const { contacts } = useContacts();
  
  return (
    <FormItem>
      <FormLabel>Related Contact (Optional)</FormLabel>
      <Select 
        onValueChange={field.onChange} 
        defaultValue={field.value}
        disabled={disabled}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select a contact" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="none">None</SelectItem>
          {contacts.map((contact) => (
            <SelectItem key={contact.id} value={contact.id}>
              {contact.fullName || contact.company || "Unnamed Contact"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
