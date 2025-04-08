
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues } from "./types";

interface AdditionalFieldsProps {
  form: UseFormReturn<ContactFormValues>;
  isMobile?: boolean;
}

const AdditionalFields: React.FC<AdditionalFieldsProps> = ({ form, isMobile }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Source</FormLabel>
              <FormControl>
                <Input 
                  placeholder="LinkedIn, Referral, etc." 
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
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel className={isMobile ? "text-sm" : ""}>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional information" 
                className={`resize-none ${isMobile ? "text-sm" : ""}`} 
                {...field} 
                value={field.value || ''} 
              />
            </FormControl>
            <FormMessage className={isMobile ? "text-xs" : ""} />
          </FormItem>
        )}
      />
    </>
  );
};

export default AdditionalFields;
