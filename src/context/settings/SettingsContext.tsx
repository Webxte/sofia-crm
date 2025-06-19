
import React, { ReactNode } from "react";
import { SafeSettingsWrapper } from "./SafeSettingsWrapper";

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SafeSettingsWrapper>
      {children}
    </SafeSettingsWrapper>
  );
};

// Re-export useSettings from ActualSettingsProvider
export { useSettings } from "./ActualSettingsProvider";
