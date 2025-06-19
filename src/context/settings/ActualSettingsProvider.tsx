
import React, { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { SettingsContextType } from "./types";
import { User } from "@supabase/supabase-js";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface ActualSettingsProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
  user: User | null;
  isAdmin: boolean;
}

// Component that actually uses the hooks - only rendered when React is ready
const SettingsProviderWithHooks = ({ 
  children, 
  isAuthenticated, 
  user, 
  isAdmin 
}: ActualSettingsProviderProps) => {
  // Only import and use hooks when this component is actually rendered
  const { useFetchSettings } = require("./useFetchSettings");
  const { useUpdateSettings } = require("./useUpdateSettings");
  
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

export const ActualSettingsProvider = (props: ActualSettingsProviderProps) => {
  const [isReactReady, setIsReactReady] = useState(false);

  useEffect(() => {
    // Ensure React is fully initialized before rendering hook-dependent components
    const timer = setTimeout(() => {
      setIsReactReady(true);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // Provide a fallback context while React initializes
  if (!isReactReady) {
    const fallbackContextValue: SettingsContextType = {
      settings: null,
      loading: true,
      updateSettings: async () => {},
      refreshSettings: () => {},
      fetchSettings: async () => {},
    };

    return (
      <SettingsContext.Provider value={fallbackContextValue}>
        {props.children}
      </SettingsContext.Provider>
    );
  }

  return <SettingsProviderWithHooks {...props} />;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
