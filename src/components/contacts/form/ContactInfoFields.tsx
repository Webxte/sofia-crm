
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Phone</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+1 (555) 123-4567" 
                  {...field} 
                  value={field.value || ''} 
                  className={isMobile ? "text-sm h-9" : ""}
                />
              </FormControl>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Mobile</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+1 (555) 987-6543" 
                  {...field} 
                  value={field.value || ''} 
                  className={isMobile ? "text-sm h-9" : ""}
                />
              </FormControl>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={isMobile ? "text-sm" : ""}>Address</FormLabel>
            <FormControl>
              <Input 
                placeholder="123 Main St, Anytown, USA" 
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
