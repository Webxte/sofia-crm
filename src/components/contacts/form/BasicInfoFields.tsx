
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "./types";

interface BasicInfoFieldsProps {
  form: UseFormReturn<ContactFormValues>;
  isMobile?: boolean;
}

const BasicInfoFields: React.FC<BasicInfoFieldsProps> = ({ form, isMobile }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} className={isMobile ? "text-sm h-9" : ""} />
              </FormControl>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Company</FormLabel>
              <FormControl>
                <Input placeholder="Acme Corp" {...field} className={isMobile ? "text-sm h-9" : ""} />
              </FormControl>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Position</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} className={isMobile ? "text-sm h-9" : ""} />
              </FormControl>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder="johndoe@example.com" 
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
    </>
  );
};

export default BasicInfoFields;
