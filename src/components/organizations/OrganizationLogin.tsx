
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { Organization } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const orgLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type OrgLoginFormValues = z.infer<typeof orgLoginSchema>;

interface OrganizationLoginProps {
  organization: Organization;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const OrganizationLogin = ({
  organization,
  open,
  onOpenChange,
  onSuccess,
}: OrganizationLoginProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<OrgLoginFormValues>({
    resolver: zodResolver(orgLoginSchema),
    defaultValues: {
      password: "",
    },
  });
  
  const onSubmit = async (data: OrgLoginFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Check if password is correct
      const { data: result, error } = await supabase.rpc(
        'check_organization_password',
        {
          org_id: organization.id,
          password: data.password
        }
      );
      
      if (error) throw error;
      
      if (result === true) {
        toast({
          title: "Success",
          description: `Access granted to ${organization.name}`,
        });
        form.reset();
        onOpenChange(false);
        onSuccess();
      } else {
        toast({
          title: "Error",
          description: "Incorrect password",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error verifying organization password:", error);
      toast({
        title: "Error",
        description: "Failed to verify password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter Organization Password</DialogTitle>
          <DialogDescription>
            Please enter the password for "{organization.name}" to access it
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder="Enter organization password" 
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Lock className="mr-2 h-4 w-4 animate-pulse" />
                ) : (
                  <LogIn className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Verifying..." : "Access Organization"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
