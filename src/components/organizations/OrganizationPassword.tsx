
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { supabase } from "@/integrations/supabase/client";

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
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export const OrganizationPassword = () => {
  const { currentOrganization, canUserPerformAction } = useOrganizations();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: PasswordFormValues) => {
    if (!currentOrganization) return;
    
    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      
      // Call the database function to change password
      const { data: result, error } = await supabase.rpc(
        'change_organization_password',
        {
          org_id: currentOrganization.id,
          old_password: data.currentPassword,
          new_password: data.newPassword
        }
      );
      
      if (error) throw error;
      
      if (result === true) {
        setSuccessMessage("Organization password updated successfully");
        form.reset();
        toast({
          title: "Success",
          description: "Organization password has been updated",
        });
      } else {
        toast({
          title: "Error",
          description: "Current password is incorrect or you don't have permission",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error changing organization password:", error);
      toast({
        title: "Error",
        description: "Failed to update organization password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if user has permission to change password
  const canChangePassword = canUserPerformAction('update');
  
  if (!currentOrganization) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Organization Password</CardTitle>
          <CardDescription>
            No organization is currently selected.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Organization Password</CardTitle>
        <CardDescription>
          Change the password for accessing this organization
        </CardDescription>
      </CardHeader>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {!canChangePassword ? (
              <Alert>
                <AlertDescription>
                  Only organization owners can change the password.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {successMessage && (
                  <Alert>
                    <AlertDescription className="text-green-600">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter current password" 
                          {...field}
                          disabled={isSubmitting || !canChangePassword}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Enter new password" 
                          {...field}
                          disabled={isSubmitting || !canChangePassword}
                        />
                      </FormControl>
                      <FormDescription>
                        Password must be at least 8 characters with uppercase, number, and special character.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password"
                          placeholder="Confirm new password" 
                          {...field}
                          disabled={isSubmitting || !canChangePassword}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </CardContent>
          
          {canChangePassword && (
            <CardFooter>
              <Button 
                type="submit" 
                disabled={isSubmitting || !canChangePassword}
              >
                <Lock className="mr-2 h-4 w-4" />
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
            </CardFooter>
          )}
        </form>
      </Form>
    </Card>
  );
};
