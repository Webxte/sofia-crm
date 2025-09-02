
import React, { createContext, useContext, useEffect, ReactNode, useState } from "react";
import { SettingsContextType } from "./types";
import { useFetchSettings } from "./useFetchSettings";
import { useUpdateSettings } from "./useUpdateSettings";
import { useAuth } from "../AuthContext";

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface DirectSettingsProviderProps {
  children: ReactNode;
}

export const DirectSettingsProvider = ({ children }: DirectSettingsProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Wait for auth to be ready before initializing settings
  useEffect(() => {
    if (!authLoading) {
      setIsReady(true);
    }
  }, [authLoading]);

  // Provide fallback context while not ready
  if (!isReady) {
    const fallbackContextValue: SettingsContextType = {
      settings: {
        id: '',
        companyName: '',
        companyAddress: '',
        companyPhone: '',
        companyEmail: '',
        defaultEmailSubject: 'Order Details',
        defaultEmailMessage: 'Please find your order details below.',
        defaultContactEmailMessage: 'Thank you for your inquiry.',
        defaultTermsAndConditions: '',
        customLinks: [],
        catalogUrl: '',
        priceListUrl: '',
        emailFooter: 'This is an automated message from your CRM system.',
        emailSenderName: 'CRM System',
        termsEnabled: false,
        defaultVatRate: 0,
        bulkEmailTemplate: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      loading: true,
      updateSettings: async () => {},
      refreshSettings: async () => {},
      fetchSettings: async () => {}
    };

    return (
      <SettingsContext.Provider value={fallbackContextValue}>
        {children}
      </SettingsContext.Provider>
    );
  }

  return <SettingsProviderWithHooks isAuthenticated={isAuthenticated}>{children}</SettingsProviderWithHooks>;
};

// Component that uses hooks - only rendered when ready
const SettingsProviderWithHooks = ({ 
  children, 
  isAuthenticated 
}: { 
  children: ReactNode; 
  isAuthenticated: boolean; 
}) => {
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
    fetchSettings: fetchOperations.refreshSettings,
    // Ensure settings always has fallback values
    settings: fetchOperations.settings || {
      id: '',
      companyName: '',
      companyAddress: '',
      companyPhone: '',
      companyEmail: '',
      defaultEmailSubject: 'Order Details',
      defaultEmailMessage: 'Please find your order details below.',
      defaultContactEmailMessage: 'Thank you for your inquiry.',
      defaultTermsAndConditions: '',
      customLinks: [],
      catalogUrl: '',
      priceListUrl: '',
      emailFooter: 'This is an automated message from your CRM system.',
      emailSenderName: 'CRM System',
      termsEnabled: false,
      defaultVatRate: 0,
      bulkEmailTemplate: '',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  };

  // Fetch settings when authenticated
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

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a DirectSettingsProvider");
  }
  return context;
};
