
import React, { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { SettingsContextType } from "./types";
import { useFetchSettings } from "./useFetchSettings";
import { useUpdateSettings } from "./useUpdateSettings";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface ActualSettingsProviderProps {
  children: ReactNode;
  isAuthenticated: boolean;
}

// Component that actually uses the hooks - only rendered when React is ready
const SettingsProviderWithHooks = ({ 
  children, 
  isAuthenticated 
}: ActualSettingsProviderProps) => {
  // Use the hooks with required arguments
  const fetchOperations = useFetchSettings(isAuthenticated);
  const updateOperations = useUpdateSettings(
    isAuthenticated, 
    true, // isAdmin - simplified for now
    fetchOperations.refreshSettings,
    fetchOperations.setSettings
  );

  const operations = {
    ...fetchOperations,
    ...updateOperations,
    fetchSettings: fetchOperations.refreshSettings // Add the missing fetchSettings method
  };

  // Fetch settings when the component mounts or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      operations.refreshSettings();
    }
  }, [isAuthenticated]);

  return (
    <SettingsContext.Provider value={operations}>
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
      settings: {
        id: '',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        defaultEmailSubject: '',
        defaultEmailMessage: '',
        defaultContactEmailMessage: '',
        defaultTermsAndConditions: '',
        customLinks: [],
        catalogUrl: '',
        priceListUrl: '',
        emailFooter: '',
        emailSenderName: '',
        termsEnabled: false,
        defaultVatRate: 0,
        bulkEmailTemplate: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      loading: false,
      updateSettings: async () => {},
      refreshSettings: async () => {},
      fetchSettings: async () => {}
    };

    return (
      <SettingsContext.Provider value={fallbackContextValue}>
        {props.children}
      </SettingsContext.Provider>
    );
  }

  return <SettingsProviderWithHooks {...props} />;
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
