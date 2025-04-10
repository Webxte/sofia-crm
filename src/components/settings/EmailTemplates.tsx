
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { getEmailPlaceholders } from "@/components/orders/email/emailUtils";

interface EmailTemplatesProps {
  initialSettings: {
    defaultEmailSubject?: string;
    defaultEmailMessage?: string;
    emailFooter?: string;
    emailSenderName?: string;
  };
  onSubmit: (data: { 
    emailFooter: string;
    emailSenderName: string;
    defaultEmailSubject: string;
    defaultEmailMessage: string;
  }) => Promise<void>;
}

const EmailTemplates: React.FC<EmailTemplatesProps> = ({ initialSettings, onSubmit }) => {
  console.log("EmailTemplates initialSettings:", initialSettings);
  
  const form = useForm({
    defaultValues: {
      defaultEmailSubject: initialSettings.defaultEmailSubject || "Order Confirmation - Ref: [Reference]",
      defaultEmailMessage: initialSettings.defaultEmailMessage || 
        "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
      emailFooter: initialSettings.emailFooter || "This is an automated message from your CRM system.",
      emailSenderName: initialSettings.emailSenderName || "CRM System"
    }
  });
  
  const placeholders = getEmailPlaceholders();
  
  const handleSubmit = async (data: { 
    defaultEmailSubject: string; 
    defaultEmailMessage: string;
    emailFooter: string;
    emailSenderName: string;
  }) => {
    console.log("Submitting email template data:", data);
    await onSubmit({
      defaultEmailSubject: data.defaultEmailSubject,
      defaultEmailMessage: data.defaultEmailMessage,
      emailFooter: data.emailFooter,
      emailSenderName: data.emailSenderName
    });
  };
  
  // Reset form when initialSettings change
  React.useEffect(() => {
    console.log("Resetting form with initialSettings:", initialSettings);
    form.reset({
      defaultEmailSubject: initialSettings.defaultEmailSubject || "Order Confirmation - Ref: [Reference]",
      defaultEmailMessage: initialSettings.defaultEmailMessage || 
        "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
      emailFooter: initialSettings.emailFooter || "This is an automated message from your CRM system.",
      emailSenderName: initialSettings.emailSenderName || "CRM System"
    });
  }, [initialSettings]);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Email Templates</CardTitle>
        <CardDescription>
          Configure default email templates for order communications
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="emailSenderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sender Name</FormLabel>
                  <FormControl>
                    <Input placeholder="CRM System" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="defaultEmailSubject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Order Confirmation - Ref: [Reference]" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="defaultEmailMessage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Email Message</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter default email message" 
                      className="min-h-32" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="emailFooter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Footer Text</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="This is an automated message from your CRM system." 
                      className="min-h-16" 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="border-t pt-4 space-y-2">
              <h4 className="font-medium text-sm">Available placeholders:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {placeholders.map((placeholder) => (
                  <div key={placeholder.name} className="text-xs">
                    <span className="font-mono bg-muted p-1 rounded">{placeholder.name}</span>
                    <span className="text-muted-foreground ml-2">{placeholder.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <Button type="submit">Save Changes</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmailTemplates;
