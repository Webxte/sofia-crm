
import React, { ReactNode } from "react";
import { SettingsProvider, useSettings } from "./SettingsContext";

interface SafeSettingsProviderProps {
  children: ReactNode;
}

export const SafeSettingsProvider = ({ children }: SafeSettingsProviderProps) => {
  try {
    return (
      <SettingsProvider>
        {children}
      </SettingsProvider>
    );
  } catch (error) {
    console.error("SafeSettingsProvider: Error in SettingsProvider:", error);
    // Return children without settings context if there's an error
    return <>{children}</>;
  }
};

// Re-export useSettings
export { useSettings };
