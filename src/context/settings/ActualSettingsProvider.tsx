
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
  // Dynamically import the hooks to ensure React is ready
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
    // Additional safety check to ensure React is fully initialized
    const checkReactReady = () => {
      try {
        // Test if React hooks are available and working
        const testState = React.useState(true);
        if (testState && typeof testState[0] === 'boolean' && typeof testState[1] === 'function') {
          setIsReactReady(true);
        }
      } catch (error) {
        console.warn("React not ready yet, retrying...", error);
        // Retry after a short delay
        setTimeout(checkReactReady, 10);
      }
    };

    checkReactReady();
  }, []);

  // Fallback provider that doesn't use problematic hooks
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
