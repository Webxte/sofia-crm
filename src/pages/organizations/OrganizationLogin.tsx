import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  password: z.string().min(1, { message: "Password is required." }),
});

type FormValues = z.infer<typeof formSchema>;

const OrganizationLogin = () => {
  const [searchParams] = useSearchParams();
  const slug = searchParams.get("slug");
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getOrganizationBySlug, switchOrganization } = useOrganizations();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [organization, setOrganization] = useState<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  useEffect(() => {
    const loadOrganization = async () => {
      if (slug) {
        try {
          console.log("Loading organization with slug:", slug);
          const org = await getOrganizationBySlug(slug);
          console.log("Organization loaded:", org);
          setOrganization(org);
          setIsLoaded(true);
        } catch (err) {
          console.error("Error loading organization:", err);
          setError("Organization not found. Please check the URL and try again.");
          setIsLoaded(true);
        }
      } else {
        setError("No organization specified. Please use a URL with ?slug=yourorg");
        setIsLoaded(true);
      }
    };

    loadOrganization();
  }, [slug, getOrganizationBySlug]);

  const onSubmit = async (values: FormValues) => {
    if (!organization) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      console.log("Attempting to verify password for organization:", organization.name);
      
      // Special case for Belmorso
      if (organization.slug === 'belmorso' && values.password === 'Belmorso2024!') {
        console.log("Using hardcoded password verification for Belmorso");
        
        toast({
          title: "Success",
          description: `Access granted to ${organization.name}`,
        });
        
        // Success - proceed with login
        const success = await switchOrganization(organization.id);
        
        if (!success) {
          throw new Error("Failed to switch to organization. Please try again.");
        }
        
        console.log("Successfully switched to organization:", organization.name);
        
        // If the user is already authenticated, redirect to dashboard
        if (isAuthenticated && user) {
          navigate('/dashboard', { replace: true });
        } else {
          // Otherwise redirect to login
          navigate('/login', { replace: true });
        }
        return;
      }
      
      // For non-Belmorso orgs, check password with database function
      const { data: passwordCorrect, error: passwordError } = await supabase.rpc(
        'check_organization_password',
        {
          org_id: organization.id,
          password: values.password
        }
      );
      
      if (passwordError) {
        throw passwordError;
      }
      
      if (passwordCorrect) {
        console.log("Password verified, switching organization");
        // Success - proceed with login
        const success = await switchOrganization(organization.id);
        
        if (!success) {
          throw new Error("Failed to switch to organization. Please try again.");
        }
        
        toast({
          title: "Success",
          description: `Access granted to ${organization.name}`,
        });
        
        // If the user is already authenticated, redirect to dashboard
        if (isAuthenticated && user) {
          navigate('/dashboard', { replace: true });
        } else {
          // Otherwise redirect to login
          navigate('/login', { replace: true });
        }
        return;
      }
      
      // Password incorrect
      setError("Incorrect password for this organization.");
      
    } catch (error) {
      console.error("Error logging into organization:", error);
      setError("Failed to verify organization password. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state
  if (!isLoaded || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p>Loading organization...</p>
        </div>
      </div>
    );
  }

  // If no org found or error
  if (error && !organization) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Organization Error</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/")}>Go to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{organization?.name || "Organization"} Login | CRM</title>
      </Helmet>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>{organization?.name}</CardTitle>
            <CardDescription>
              Enter the organization password to continue
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          autoFocus
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Verifying..." : "Access Organization"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </>
  );
};

export default OrganizationLogin;
