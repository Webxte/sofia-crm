
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts } from "@/context/contacts/ContactsContext";
import { UseFormReturn } from "react-hook-form";
import { MeetingFormValues } from "../validation/meetingSchema";

interface ContactFieldProps {
  form: UseFormReturn<MeetingFormValues>;
  disabled?: boolean;
}

export const ContactField = ({ form, disabled }: ContactFieldProps) => {
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

  const getDisplayName = (contact: any) => {
    if (contact.company) {
      return contact.fullName ? `${contact.company} (${contact.fullName})` : contact.company;
    }
    return contact.fullName || "Unnamed Contact";
  };

  return (
    <FormField
      control={form.control}
      name="contactId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Company/Contact</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a company or contact" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {sortedContacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {getDisplayName(contact)}
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
