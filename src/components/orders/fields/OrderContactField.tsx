
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContacts } from "@/context/ContactsContext";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../validation/orderSchema";

interface OrderContactFieldProps {
  form: UseFormReturn<OrderFormValues>;
  disabled?: boolean;
}

export const OrderContactField = ({ form, disabled }: OrderContactFieldProps) => {
  const { contacts } = useContacts();

  return (
    <FormField
      control={form.control}
      name="contactId"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Customer</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {contacts.map((contact) => (
                <SelectItem key={contact.id} value={contact.id}>
                  {contact.company ? `${contact.company}${contact.fullName ? ` (${contact.fullName})` : ''}` : (contact.fullName || "Unnamed Contact")}
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
