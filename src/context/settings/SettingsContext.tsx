
import { createContext, useContext, useEffect, ReactNode } from "react";
import { SettingsContextType } from "./types";
import { useFetchSettings } from "./useFetchSettings";
import { useUpdateSettings } from "./useUpdateSettings";
import { useAuth } from "../AuthContext";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const { settings, setSettings, loading, refreshSettings } = useFetchSettings(isAuthenticated);
  const { updateSettings } = useUpdateSettings(setSettings);

  useEffect(() => {
    console.log("SettingsProvider: Authentication state changed", { 
      isAuthenticated, 
      userId: user?.id,
      hasUser: !!user,
      preview: window.location.hostname.includes('preview'),
      published: !window.location.hostname.includes('preview')
    });
    
    if (isAuthenticated && user?.id) {
      console.log("SettingsProvider: Fetching settings for authenticated user");
      refreshSettings();
    } else {
      console.log("SettingsProvider: User not authenticated or no user ID");
    }
  }, [isAuthenticated, user?.id, refreshSettings]);

  const contextValue: SettingsContextType = {
    settings,
    loading,
    updateSettings,
    refreshSettings,
    fetchSettings: refreshSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
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
