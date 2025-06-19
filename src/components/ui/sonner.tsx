
import React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Check if we're in a proper React context without using hooks
  try {
    // Simple check to see if React is properly initialized
    if (typeof window !== 'undefined' && window.React === undefined) {
      // If we're in browser but React isn't available, don't render
      return null;
    }
  } catch (error) {
    // If any error occurs during the check, don't render
    console.warn("Toaster: React context not ready, skipping render");
    return null;
  }

  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
