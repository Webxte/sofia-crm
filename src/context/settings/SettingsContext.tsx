
import { createContext, useContext, useEffect, ReactNode } from "react";
import { SettingsContextType } from "./types";
import { useSettingsOperations } from "./useSettingsOperations";
import { useAuth } from "../AuthContext";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, user } = useAuth();
  const settingsOperations = useSettingsOperations(isAuthenticated, user);

  useEffect(() => {
    console.log("SettingsProvider: Authentication state changed", { 
      isAuthenticated, 
      userId: user?.id,
      hasUser: !!user 
    });
    
    if (isAuthenticated && user?.id) {
      console.log("SettingsProvider: Fetching settings for authenticated user");
      settingsOperations.fetchSettings();
    } else {
      console.log("SettingsProvider: User not authenticated or no user ID");
    }
  }, [isAuthenticated, user?.id]);

  return (
    <SettingsContext.Provider value={settingsOperations}>
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
