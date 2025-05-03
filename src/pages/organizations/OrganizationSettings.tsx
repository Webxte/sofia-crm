
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Building, Save } from "lucide-react";
import { Helmet } from "react-helmet-async";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationMembers } from "@/components/organizations/OrganizationMembers";
import { OrganizationBranding } from "@/components/organizations/OrganizationBranding";
import { OrganizationPassword } from "@/components/organizations/OrganizationPassword";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Organization name must be at least 2 characters." })
    .max(50, { message: "Organization name must be 50 characters or less." }),
  slug: z
    .string()
    .min(2, { message: "Slug must be at least 2 characters." })
    .max(30, { message: "Slug must be 30 characters or less." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

const OrganizationSettings = () => {
  const { currentOrganization, updateOrganization, canUserPerformAction } = useOrganizations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { trackEvent } = useAnalytics();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    values: {
      name: currentOrganization?.name || "",
      slug: currentOrganization?.slug || "",
    },
  });
  
  const onSubmit = async (values: FormValues) => {
    if (!currentOrganization) return;
    
    try {
      setIsSubmitting(true);
      
      const success = await updateOrganization(currentOrganization.id, {
        name: values.name,
        slug: values.slug,
      });
      
      if (success) {
        trackEvent('organization_updated', { organizationId: currentOrganization.id });
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
    <>
      <Helmet>
        <title>Organization Settings | CRM</title>
      </Helmet>
      
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Building className="h-6 w-6" />
            Organization Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your organization settings, members, and branding.
          </p>
        </div>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="branding">Branding</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>
                  Update your organization details.
                </CardDescription>
              </CardHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Acme Corp" 
                              {...field} 
                              disabled={!canUpdate || isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Slug</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="acme" 
                              {...field} 
                              disabled={!canUpdate || isSubmitting}
                            />
                          </FormControl>
                          <FormDescription>
                            Used in URLs and as your organization's unique identifier.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
          </TabsContent>
          
          <TabsContent value="members" className="mt-4">
            <OrganizationMembers />
          </TabsContent>
          
          <TabsContent value="security" className="mt-4">
            <OrganizationPassword />
          </TabsContent>
          
          <TabsContent value="branding" className="mt-4">
            <OrganizationBranding />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default OrganizationSettings;
