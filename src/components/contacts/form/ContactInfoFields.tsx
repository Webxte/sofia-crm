
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "./types";

interface ContactInfoFieldsProps {
  form: UseFormReturn<ContactFormValues>;
  isMobile?: boolean;
}

const ContactInfoFields: React.FC<ContactInfoFieldsProps> = ({ form, isMobile }) => {
  return (
    <>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={isMobile ? "text-sm" : ""}>Address</FormLabel>
            <FormControl>
              <Input 
                placeholder="123 Main St, Anytown, Ireland" 
                {...field} 
                value={field.value || ''} 
                className={isMobile ? "text-sm h-9" : ""}
              />
            </FormControl>
            <FormMessage className={isMobile ? "text-xs" : ""} />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContactInfoFields;
