
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";

interface LoginFormProps {
  onSubmit: (password: string) => Promise<void>;
  loading?: boolean;
}

export const LoginForm = ({ onSubmit, loading = false }: LoginFormProps) => {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim() || isSubmitting || loading) return;

    setIsSubmitting(true);
    try {
      await onSubmit(password);
    } catch (error) {
      console.error("Login form error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLoading = loading || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password">Organization Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          disabled={isLoading}
          required
        />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!password.trim() || isLoading}
      >
        {isLoading ? (
          <>
            <Lock className="mr-2 h-4 w-4 animate-spin" />
            Verifying...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Access Organization
          </>
        )}
      </Button>
    </form>
  );
};
