
import React from "react";
import { Toaster as Sonner } from "sonner";
import { useTheme } from "next-themes";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Use a safe theme hook that handles the context not being ready
  let theme = "light";
  try {
    const themeContext = useTheme();
    theme = themeContext.theme || "light";
  } catch (error) {
    // If theme context is not ready, use default light theme
    console.warn("Toaster: Theme context not ready, using default theme");
  }

  return (
    <Sonner
      theme={theme as "light" | "dark"}
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
