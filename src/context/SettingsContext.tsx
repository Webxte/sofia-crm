
import { createContext, useContext, useState, ReactNode } from "react";
import { Settings } from "@/types";

interface SettingsContextType {
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  id: "1",
  defaultTermsAndConditions: "All products delivered are sole property of the company until payment is made in full.",
  companyName: "Your Company Name",
  companyAddress: "Your Company Address",
  companyPhone: "+1234567890",
  companyEmail: "contact@yourcompany.com",
  defaultVatRate: 20,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...newSettings }));
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSettings,
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
