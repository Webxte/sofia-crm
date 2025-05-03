
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";

const formSchema = z.object({
  logoUrl: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal("")),
  primaryColor: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, {
      message: "Please enter a valid hex color code (e.g., #FF0000).",
    })
    .optional()
    .or(z.literal("")),
  secondaryColor: z
    .string()
    .regex(/^#([0-9A-F]{3}){1,2}$/i, {
      message: "Please enter a valid hex color code (e.g., #FF0000).",
    })
    .optional()
    .or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

export const OrganizationBranding = () => {
  const { currentOrganization, updateOrganization, canUserPerformAction } = useOrganizations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useAnalytics();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      logoUrl: currentOrganization?.logoUrl || "",
      primaryColor: currentOrganization?.primaryColor || "#000000",
      secondaryColor: currentOrganization?.secondaryColor || "#ffffff",
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!currentOrganization) return;
    
    try {
      setIsSubmitting(true);
      
      const success = await updateOrganization(currentOrganization.id, {
        logoUrl: values.logoUrl || undefined,
        primaryColor: values.primaryColor || undefined,
        secondaryColor: values.secondaryColor || undefined,
      });
      
      if (success) {
        trackEvent('organization_branding_updated', {
          organizationId: currentOrganization.id
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check permission
  const canUpdate = canUserPerformAction('update');
  
  if (!currentOrganization) {
    return (
      <div className="text-center py-12">
        <p>No organization selected.</p>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding</CardTitle>
        <CardDescription>
          Customize your organization's branding.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/logo.png" 
                      {...field} 
                      disabled={!canUpdate || isSubmitting} 
                    />
                  </FormControl>
                  <FormDescription>
                    URL to your organization's logo image.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="#000000" 
                          {...field} 
                          disabled={!canUpdate || isSubmitting} 
                        />
                      </FormControl>
                      <div 
                        className="w-10 h-10 border rounded" 
                        style={{ backgroundColor: field.value || "#000000" }} 
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          placeholder="#ffffff" 
                          {...field} 
                          disabled={!canUpdate || isSubmitting} 
                        />
                      </FormControl>
                      <div 
                        className="w-10 h-10 border rounded" 
                        style={{ backgroundColor: field.value || "#ffffff" }} 
                      />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {currentOrganization.logoUrl && (
              <div className="mt-4">
                <FormLabel>Logo Preview</FormLabel>
                <div className="mt-2 p-4 border rounded flex justify-center">
                  <img 
                    src={currentOrganization.logoUrl} 
                    alt="Organization Logo" 
                    className="max-h-20" 
                  />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              disabled={!canUpdate || isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};
