
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts } from "@/context/contacts/ContactsContext";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

// Define the order form values type without relying on an external schema
interface OrderFormValues {
  contactId: string;
  date: Date;
  notes?: string;
  status: "draft" | "confirmed" | "shipped" | "delivered" | "paid" | "cancelled";
  reference?: string;
  termsAndConditions?: string;
}

interface OrderContactFieldProps {
  form: UseFormReturn<OrderFormValues>;
  disabled?: boolean;
}

export const OrderContactField = ({ form, disabled }: OrderContactFieldProps) => {
  const { contacts } = useContacts();

  // Sort contacts to show companies first
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
    <FormField
      control={form.control}
      name="contactId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer/Company</FormLabel>
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
                  {contact.company ? 
                    `${contact.company}${contact.fullName ? ` (${contact.fullName})` : ''}` : 
                    (contact.fullName || "Unnamed Contact")}
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
