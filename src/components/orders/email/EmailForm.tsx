
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { emailFormSchema, EmailFormValues } from "./emailSchema";
import { DialogFooter } from "@/components/ui/dialog";

interface EmailFormProps {
  defaultValues: EmailFormValues;
  onSubmit: (values: EmailFormValues) => Promise<boolean>;
  onCancel: () => void;
  isSending: boolean;
  loadingCustomerEmail: boolean;
}

export const EmailForm = ({ 
  defaultValues, 
  onSubmit, 
  onCancel, 
  isSending,
  loadingCustomerEmail
}: EmailFormProps) => {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues,
  });

  const handleSubmit = async (values: EmailFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Email</FormLabel>
              <FormControl>
                <Input 
                  placeholder={loadingCustomerEmail ? "Loading customer email..." : "customer@example.com"} 
                  {...field} 
                  disabled={loadingCustomerEmail}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="cc"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CC (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="email1@example.com, email2@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea rows={10} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSending}>
            {isSending ? "Sending..." : "Send Email"}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
