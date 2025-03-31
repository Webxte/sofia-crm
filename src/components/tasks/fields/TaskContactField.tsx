
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
  
  // Sort contacts to prioritize companies
  const sortedContacts = [...contacts].sort((a, b) => {
    // If both have company names, sort alphabetically
    if (a.company && b.company) {
      return a.company.localeCompare(b.company);
    }
    // If only a has company, put a first
    if (a.company) return -1;
    // If only b has company, put b first
    if (b.company) return 1;
    // If neither has company, sort by full name
    return (a.fullName || "").localeCompare(b.fullName || "");
  });
  
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
          {sortedContacts.map((contact) => (
            <SelectItem key={contact.id} value={contact.id}>
              {contact.company ? 
                `${contact.company}${contact.fullName ? ` (${contact.fullName})` : ''}` : 
                (contact.fullName || "Unnamed Contact")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};
