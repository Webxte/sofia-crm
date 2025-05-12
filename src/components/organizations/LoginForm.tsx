
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Organization } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  password: z.string().min(1, { message: "Password is required" }),
});

type FormValues = z.infer<typeof formSchema>;

interface LoginFormProps {
  organization: Organization | null;
  isSubmitting: boolean;
  error?: string | null;
  onSubmit: (password: string) => void;
}

export function LoginForm({ organization, isSubmitting, error, onSubmit }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });
  
  const handleSubmit = (values: FormValues) => {
    onSubmit(values.password);
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}
        
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Password</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="text-sm text-gray-500 mt-1">
                <p>The password for Belmorso is: <strong>Belmorso2024!</strong></p>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Verifying..." : "Continue"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
