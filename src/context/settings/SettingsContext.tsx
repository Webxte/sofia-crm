
import { createContext, useContext, useEffect, ReactNode } from "react";
import { SettingsContextType } from "./types";
import { useSettingsOperations } from "./useSettingsOperations";
import { useAuth } from "../AuthContext";
import { Settings } from "@/types";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { 
    settings, 
    loading, 
    refreshSettings, 
    updateSettings 
  } = useSettingsOperations(isAuthenticated, isAdmin);

  useEffect(() => {
    if (isAuthenticated) {
      refreshSettings();
    }
  }, [isAuthenticated, refreshSettings]);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        updateSettings,
        refreshSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
