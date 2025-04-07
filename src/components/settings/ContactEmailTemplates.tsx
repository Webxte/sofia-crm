
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";

interface ContactEmailTemplatesProps {
  initialSettings: {
    defaultContactEmailMessage?: string;
    catalogUrl?: string;
    priceListUrl?: string;
  };
  onSubmit: (data: { 
    defaultContactEmailMessage: string;
    catalogUrl: string;
    priceListUrl: string;
  }) => Promise<void>;
}

const ContactEmailTemplates: React.FC<ContactEmailTemplatesProps> = ({ 
  initialSettings, 
  onSubmit 
}) => {
  const form = useForm({
    defaultValues: {
      defaultContactEmailMessage: initialSettings.defaultContactEmailMessage || 
        "Dear [Name],\n\nThank you for your time during our recent meeting. As discussed, I've attached the links to our product catalog and price list.\n\nCatalog: [Catalog URL]\nPrice List: [Price List URL]\n\nPlease don't hesitate to reach out if you have any questions.\n\nBest regards,\n[Company Name]",
      catalogUrl: initialSettings.catalogUrl || "",
      priceListUrl: initialSettings.priceListUrl || "",
    }
  });
  
  const handleSubmit = async (data: { 
    defaultContactEmailMessage: string;
    catalogUrl: string;
    priceListUrl: string;
  }) => {
    await onSubmit(data);
  };
  
  const placeholders = [
    { name: "[Name]", description: "Contact's name" },
    { name: "[Company Name]", description: "Your company name" },
    { name: "[Catalog URL]", description: "URL to your product catalog" },
    { name: "[Price List URL]", description: "URL to your price list" }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Email Templates</CardTitle>
        <CardDescription>
          Configure default email templates for contacting customers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Product Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
              control={form.control}
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

export default ContactEmailTemplates;
