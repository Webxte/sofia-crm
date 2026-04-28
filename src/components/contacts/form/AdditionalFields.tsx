
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { ContactFormValues, CONTACT_CATEGORIES } from "./types";

const CONTACT_TYPE_OPTIONS = [
  { value: 'lead',     label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
];

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
          name="contactType"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Contact Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || "lead"}>
                <FormControl>
                  <SelectTrigger className={isMobile ? "text-sm h-9" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTACT_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={isMobile ? "text-sm" : ""}>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className={isMobile ? "text-sm h-9" : ""}>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CONTACT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className={isMobile ? "text-xs" : ""} />
            </FormItem>
          )}
        />
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
