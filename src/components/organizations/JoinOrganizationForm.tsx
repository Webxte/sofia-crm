
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { DoorOpen } from "lucide-react";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  slug: z
    .string()
    .min(2, { message: "Organization slug must be at least 2 characters." })
    .max(30, { message: "Organization slug must be 30 characters or less." })
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens.",
    }),
  password: z
    .string()
    .min(1, { message: "Password is required." })
});

type FormValues = z.infer<typeof formSchema>;

export function JoinOrganizationForm() {
  const { fetchOrganizations, getOrganizationBySlug, switchOrganization } = useOrganizations();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: "belmorso", // Pre-fill with Belmorso
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    console.log("Join form submitted", values);
    
    if (!user) {
      toast({
        title: "Error", 
        description: "You must be logged in to join an organization",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // First, find the organization by slug
      const organization = await getOrganizationBySlug(values.slug);
      console.log("Found organization:", organization);
      
      if (!organization) {
        setError("Organization not found. Please check the slug and try again.");
        return;
      }
      
      // Special case for Belmorso organization - hardcoded verification
      const isBelmorsoOrg = organization.slug === 'belmorso';
      let isPasswordCorrect = false;
      
      if (isBelmorsoOrg && values.password === 'Belmorso2024!') {
        // Hardcoded password for Belmorso
        isPasswordCorrect = true;
        console.log("Using hardcoded password verification for Belmorso");
      } else {
        // For other organizations, try to verify using Supabase RPC
        try {
          const { data: verificationResult, error: passwordError } = await supabase.rpc(
            'check_organization_password',
            {
              org_id: organization.id,
              password: values.password
            }
          );
          
          if (passwordError) throw passwordError;
          isPasswordCorrect = !!verificationResult;
          console.log("Password verification result:", isPasswordCorrect);
        } catch (verifyError) {
          console.error("Error verifying password:", verifyError);
          // Fallback to hardcoded password verification for Belmorso
          if (isBelmorsoOrg && values.password === 'Belmorso2024!') {
            isPasswordCorrect = true;
            console.log("Fallback: Using hardcoded password for Belmorso");
          }
        }
      }
      
      if (!isPasswordCorrect) {
        setError("Incorrect password for this organization.");
        return;
      }
      
      // Check if user is already a member
      const { data: existingMembership, error: membershipError } = await supabase
        .from('organization_members')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (membershipError) throw membershipError;
      
      console.log("Existing membership check:", existingMembership);
      
      if (existingMembership) {
        // User is already a member, just switch to this organization
        await switchOrganization(organization.id);
        toast({
          title: "Success",
          description: `You already belong to ${organization.name}. Switching to this organization.`,
        });
        trackEvent('organization_accessed', { organizationId: organization.id });
        navigate('/dashboard');
        return;
      }
      
      // Add user as a member with owner role for Belmorso
      const { error: addMemberError } = await supabase
        .from('organization_members')
        .insert([
          {
            organization_id: organization.id,
            user_id: user.id,
            role: isBelmorsoOrg ? 'owner' : 'member' // Make the user an owner for Belmorso
          }
        ]);
      
      if (addMemberError) {
        console.error("Error adding member:", addMemberError);
        throw addMemberError;
      }
      
      console.log("Successfully added as member, fetching organizations");
      
      // Fetch updated organizations and switch to the joined one
      await fetchOrganizations();
      await switchOrganization(organization.id);
      
      toast({
        title: "Success",
        description: `You have successfully joined ${organization.name}`,
      });
      
      trackEvent('organization_joined', { organizationId: organization.id });
      navigate('/dashboard');
      
    } catch (error) {
      console.error("Error joining organization:", error);
      setError("Failed to join organization. Please try again later.");
      toast({
        title: "Error",
        description: "Failed to join organization",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-[600px] mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DoorOpen className="h-5 w-5 text-primary" />
          <CardTitle>Join Existing Organization</CardTitle>
        </div>
        <CardDescription>
          Enter the slug and password for an organization you'd like to join.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="belmorso" {...field} />
                  </FormControl>
                  <FormDescription>
                    The unique identifier of the organization.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormDescription>
                    The password for Belmorso is: Belmorso2024!
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/login")}>
              Back to Login
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Joining..." : "Join Organization"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
