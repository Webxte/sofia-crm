
import { createContext, useContext, useEffect, ReactNode } from "react";
import { SettingsContextType } from "./types";
import { useFetchSettings } from "./useFetchSettings";
import { useUpdateSettings } from "./useUpdateSettings";
import { useAuth } from "../AuthContext";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  // Add safety check to prevent rendering before React is initialized
  if (typeof window === 'undefined') {
    return <>{children}</>;
  }

  const authContext = useAuth();
  
  // Early return if auth context is not available yet
  if (!authContext) {
    console.warn("SettingsProvider: Auth context not available yet");
    return <>{children}</>;
  }

  const { isAuthenticated, user, isAdmin } = authContext;
  
  // Add safety check to ensure auth context is properly initialized
  if (typeof isAuthenticated === 'undefined') {
    console.warn("SettingsProvider: Auth context not yet initialized");
    return <>{children}</>;
  }
  
  const { settings, setSettings, loading, refreshSettings } = useFetchSettings(isAuthenticated);
  const { updateSettings } = useUpdateSettings(isAuthenticated, isAdmin, refreshSettings, setSettings);

  useEffect(() => {
    console.log("SettingsProvider: Authentication state changed", { 
      isAuthenticated, 
      userId: user?.id,
      hasUser: !!user,
      isAdmin,
      preview: window.location.hostname.includes('preview'),
      published: !window.location.hostname.includes('preview')
    });
    
    // Only try to fetch settings if user is authenticated and is an admin
    if (isAuthenticated && user?.id && isAdmin) {
      console.log("SettingsProvider: Fetching settings for authenticated admin user");
      refreshSettings();
    } else if (isAuthenticated && user?.id && !isAdmin) {
      console.log("SettingsProvider: User is authenticated but not admin - using default settings");
    } else {
      console.log("SettingsProvider: User not authenticated or no user ID");
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
