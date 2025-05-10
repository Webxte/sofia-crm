
import React, { useState, useEffect } from "react";
import { Navigate, useNavigate, useLocation } from "react-router-dom";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { AlertCircle, LogIn, ArrowLeft } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();
  const { currentOrganization } = useOrganizations();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the previous location from state if available
  const from = location.state?.from?.pathname || "/dashboard";
  
  // Reset error when component mounts or when form values change
  useEffect(() => {
    setError(null);
  }, []);

  // Redirect to organization selection if no organization is selected
  if (!currentOrganization) {
    return <Navigate to="/organizations/login?slug=belmorso" replace />;
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      setError(null);
      await login(data.email, data.password);
      
      toast({
        title: "Login successful",
        description: "Welcome back to your account",
      });
      
      // Login successful, redirecting happens via auth effect
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle different error types
      if (error.message?.includes("Email not confirmed")) {
        setError("Please check your email to confirm your account before logging in.");
      } else if (error.message?.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError(error.message || "Login failed. Please try again.");
      }
      
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // If authenticated and organization is selected, redirect to dashboard
  if (isAuthenticated && currentOrganization) {
    return <Navigate to={from} replace />;
  }

  const isSubmitting = loading || authLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/40">
      <div className="mx-auto w-full max-w-md space-y-6 rounded-lg border bg-card p-6 shadow-lg">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to {currentOrganization?.name || "CRM"}</h1>
          <p className="text-muted-foreground">Enter your credentials to access your account</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="your@email.com" 
                      {...field} 
                      disabled={isSubmitting}
                      autoFocus
                    />
                  </FormControl>
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
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/organizations/login?slug=belmorso")}
                disabled={isSubmitting}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Organization
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Contact your administrator if you have trouble logging in
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
