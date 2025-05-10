
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  message?: string;
  description?: string;
}

export const LoadingSpinner = ({
  size = "md",
  className,
  message,
  description,
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-12 w-12 border-4",
    lg: "h-16 w-16 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-primary border-t-transparent",
          sizeClasses[size]
        )}
      />
      {message && <p className="mt-4 text-lg font-medium">{message}</p>}
      {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
};
