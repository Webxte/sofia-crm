
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts } from "@/context/ContactsContext";
import { UseFormReturn } from "react-hook-form";
import { MeetingFormValues } from "../validation/meetingSchema";

interface ContactFieldProps {
  form: UseFormReturn<MeetingFormValues>;
  disabled?: boolean;
}

export const ContactField = ({ form, disabled }: ContactFieldProps) => {
  const { contacts } = useContacts();

  return (
    <FormField
      control={form.control}
      name="contactId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Contact</FormLabel>
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
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.fullName || contact.company || "Unnamed Contact"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
