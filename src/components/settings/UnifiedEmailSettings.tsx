
import React from "react";
import { Settings } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { getEmailPlaceholders } from "@/components/orders/email/emailUtils";

interface UnifiedEmailSettingsProps {
  initialSettings: Settings;
  onSubmit: (data: Partial<Settings>) => Promise<void>;
}

const UnifiedEmailSettings: React.FC<UnifiedEmailSettingsProps> = ({ initialSettings, onSubmit }) => {
  const [activeTab, setActiveTab] = React.useState("general");
  
  const generalForm = useForm({
    defaultValues: {
      emailSenderName: initialSettings.emailSenderName || "CRM System",
      emailFooter: initialSettings.emailFooter || "This is an automated message from your CRM system.",
      showFooterInEmails: true,
    }
  });
  
  const orderEmailForm = useForm({
    defaultValues: {
      defaultEmailSubject: initialSettings.defaultEmailSubject || "Order Confirmation - Ref: [Reference]",
      defaultEmailMessage: initialSettings.defaultEmailMessage || 
        "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
    }
  });
  
  const contactEmailForm = useForm({
    defaultValues: {
      defaultContactEmailMessage: initialSettings.defaultContactEmailMessage || 
        "Dear [Name],\n\nThank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.\n\nCatalog: [Catalog URL]\nPrice List: [Price List URL]\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Company Name]",
      catalogUrl: initialSettings.catalogUrl || "",
      priceListUrl: initialSettings.priceListUrl || "",
    }
  });
  
  const bulkEmailForm = useForm({
    defaultValues: {
      bulkEmailTemplate: initialSettings.bulkEmailTemplate || 
        "Dear Customers,\n\nWe would like to inform you about [Subject].\n\n[Message]\n\nBest regards,\n[Company Name]",
    }
  });
  
  // Reset forms when initialSettings change
  React.useEffect(() => {
    generalForm.reset({
      emailSenderName: initialSettings.emailSenderName || "CRM System",
      emailFooter: initialSettings.emailFooter || "This is an automated message from your CRM system.",
      showFooterInEmails: true,
    });
    
    orderEmailForm.reset({
      defaultEmailSubject: initialSettings.defaultEmailSubject || "Order Confirmation - Ref: [Reference]",
      defaultEmailMessage: initialSettings.defaultEmailMessage || 
        "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
    });
    
    contactEmailForm.reset({
      defaultContactEmailMessage: initialSettings.defaultContactEmailMessage || 
        "Dear [Name],\n\nThank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.\n\nCatalog: [Catalog URL]\nPrice List: [Price List URL]\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Company Name]",
      catalogUrl: initialSettings.catalogUrl || "",
      priceListUrl: initialSettings.priceListUrl || "",
    });
    
    bulkEmailForm.reset({
      bulkEmailTemplate: initialSettings.bulkEmailTemplate || 
        "Dear Customers,\n\nWe would like to inform you about [Subject].\n\n[Message]\n\nBest regards,\n[Company Name]",
    });
  }, [initialSettings]);
  
  const handleSaveGeneral = async (data: any) => {
    await onSubmit({
      emailSenderName: data.emailSenderName,
      emailFooter: data.emailFooter,
      showFooterInEmails: data.showFooterInEmails,
    });
  };
  
  const handleSaveOrderEmail = async (data: any) => {
    await onSubmit({
      defaultEmailSubject: data.defaultEmailSubject,
      defaultEmailMessage: data.defaultEmailMessage,
    });
  };
  
  const handleSaveContactEmail = async (data: any) => {
    await onSubmit({
      defaultContactEmailMessage: data.defaultContactEmailMessage,
      catalogUrl: data.catalogUrl,
      priceListUrl: data.priceListUrl,
    });
  };
  
  const handleSaveBulkEmail = async (data: any) => {
    await onSubmit({
      bulkEmailTemplate: data.bulkEmailTemplate,
    });
  };
  
  const orderEmailPlaceholders = getEmailPlaceholders();
  
  const contactEmailPlaceholders = [
    { name: "[Name]", description: "Contact's name" },
    { name: "[Company]", description: "Contact's company" },
    { name: "[Company Name]", description: "Your company name" },
    { name: "[Catalog URL]", description: "URL to your product catalog" },
    { name: "[Price List URL]", description: "URL to your price list" }
  ];
  
  const bulkEmailPlaceholders = [
    { name: "[Subject]", description: "Email subject placeholder" },
    { name: "[Message]", description: "Main message body placeholder" },
    { name: "[Company Name]", description: "Your company name" }
  ];
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="order">Order Emails</TabsTrigger>
          <TabsTrigger value="contact">Contact Emails</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Emails</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email General Settings</CardTitle>
              <CardDescription>
                Configure common settings for all email templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...generalForm}>
                <form onSubmit={generalForm.handleSubmit(handleSaveGeneral)} className="space-y-6">
                  <FormField
                    control={generalForm.control}
                    name="emailSenderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sender Name</FormLabel>
                        <FormDescription>
                          The name that will appear as the sender for all emails
                        </FormDescription>
                        <FormControl>
                          <Input placeholder="CRM System" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="emailFooter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Footer Text</FormLabel>
                        <FormDescription>
                          Text that can appear at the bottom of all emails
                        </FormDescription>
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
                  
                  <FormField
                    control={generalForm.control}
                    name="showFooterInEmails"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Show Footer in Emails
                          </FormLabel>
                          <FormDescription>
                            Whether to display the footer text in sent emails
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save General Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="order" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Email Templates</CardTitle>
              <CardDescription>
                Configure default email templates for order communications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...orderEmailForm}>
                <form onSubmit={orderEmailForm.handleSubmit(handleSaveOrderEmail)} className="space-y-6">
                  <FormField
                    control={orderEmailForm.control}
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
                    control={orderEmailForm.control}
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
                  
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-medium text-sm">Available placeholders:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {orderEmailPlaceholders.map((placeholder) => (
                        <div key={placeholder.name} className="text-xs">
                          <span className="font-mono bg-muted p-1 rounded">{placeholder.name}</span>
                          <span className="text-muted-foreground ml-2">{placeholder.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button type="submit">Save Order Email Template</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Email Templates</CardTitle>
              <CardDescription>
                Configure templates for contacting customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...contactEmailForm}>
                <form onSubmit={contactEmailForm.handleSubmit(handleSaveContactEmail)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium">Product Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={contactEmailForm.control}
                        name="catalogUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Catalog URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/catalog" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={contactEmailForm.control}
                        name="priceListUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price List URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/prices" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <FormField
                    control={contactEmailForm.control}
                    name="defaultContactEmailMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Contact Email Message</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter default message" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-medium text-sm">Available placeholders:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {contactEmailPlaceholders.map((placeholder) => (
                        <div key={placeholder.name} className="text-xs">
                          <span className="font-mono bg-muted p-1 rounded">{placeholder.name}</span>
                          <span className="text-muted-foreground ml-2">{placeholder.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button type="submit">Save Contact Email Template</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Email Template</CardTitle>
              <CardDescription>
                Configure template for sending emails to multiple contacts at once
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...bulkEmailForm}>
                <form onSubmit={bulkEmailForm.handleSubmit(handleSaveBulkEmail)} className="space-y-6">
                  <FormField
                    control={bulkEmailForm.control}
                    name="bulkEmailTemplate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bulk Email Template</FormLabel>
                        <FormDescription>
                          This template will be used when sending emails to multiple contacts
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter bulk email template" 
                            className="min-h-32" 
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-medium text-sm">Available placeholders:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {bulkEmailPlaceholders.map((placeholder) => (
                        <div key={placeholder.name} className="text-xs">
                          <span className="font-mono bg-muted p-1 rounded">{placeholder.name}</span>
                          <span className="text-muted-foreground ml-2">{placeholder.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button type="submit">Save Bulk Email Template</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedEmailSettings;
