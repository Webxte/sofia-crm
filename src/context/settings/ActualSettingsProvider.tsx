
import { createContext, useContext, useEffect, ReactNode } from "react";
import { SettingsContextType } from "./types";
import { useFetchSettings } from "./useFetchSettings";
import { useUpdateSettings } from "./useUpdateSettings";
import { User } from "@supabase/supabase-js";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface ActualSettingsProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
}

export const ActualSettingsProvider = ({ 
  children, 
  isAuthenticated, 
  user, 
  isAdmin 
}: ActualSettingsProviderProps) => {
  // Now we can safely call hooks unconditionally
  const { settings, setSettings, loading, refreshSettings } = useFetchSettings(isAuthenticated);
  const { updateSettings } = useUpdateSettings(isAuthenticated, isAdmin, refreshSettings, setSettings);

  useEffect(() => {
    console.log("ActualSettingsProvider: Authentication state changed", { 
      isAuthenticated, 
      userId: user?.id,
      hasUser: !!user,
      isAdmin,
      preview: window.location.hostname.includes('preview'),
      published: !window.location.hostname.includes('preview')
    });
    
    // Only try to fetch settings if user is authenticated and is an admin
    if (isAuthenticated && user?.id && isAdmin) {
      console.log("ActualSettingsProvider: Fetching settings for authenticated admin user");
      refreshSettings();
    } else if (isAuthenticated && user?.id && !isAdmin) {
      console.log("ActualSettingsProvider: User is authenticated but not admin - using default settings");
    } else {
      console.log("ActualSettingsProvider: User not authenticated or no user ID");
    }
  }, [isAuthenticated, user?.id, isAdmin, refreshSettings]);

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
