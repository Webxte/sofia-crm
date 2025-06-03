
import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSettingsOperations } from "./settings/useSettingsOperations";
import { SettingsContextType } from "./settings/types";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  const settingsOperations = useSettingsOperations(isAuthenticated, isAdmin);

  return (
    <SettingsContext.Provider value={settingsOperations}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
