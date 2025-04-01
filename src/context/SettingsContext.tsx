import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Settings } from "@/types";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: Settings = {
  id: "1",
  defaultTermsAndConditions: "All products delivered are sole property of the company until payment is made in full.",
  companyName: "Your Company Name",
  companyAddress: "Your Company Address",
  companyPhone: "+1234567890",
  companyEmail: "contact@yourcompany.com",
  defaultVatRate: 0,
  defaultEmailSubject: "Order Confirmation - Ref: [Reference]",
  defaultEmailMessage: "Dear [Name],\n\nYour order (Ref: [Reference]) from [Date] has been processed.\n\nThank you for your business.",
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated) {
      refreshSettings();
    } else {
      setSettings(defaultSettings);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const refreshSettings = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setSettings(defaultSettings);
        return;
      }
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching settings:', error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        const formattedSettings: Settings = {
          id: data.id,
          defaultTermsAndConditions: data.default_terms_and_conditions || defaultSettings.defaultTermsAndConditions,
          companyName: data.company_name || defaultSettings.companyName,
          companyAddress: data.company_address || defaultSettings.companyAddress,
          companyPhone: data.company_phone || defaultSettings.companyPhone,
          companyEmail: data.company_email || defaultSettings.companyEmail,
          defaultVatRate: data.default_vat_rate || defaultSettings.defaultVatRate,
          defaultEmailSubject: data.default_email_subject || defaultSettings.defaultEmailSubject,
          defaultEmailMessage: data.default_email_message || defaultSettings.defaultEmailMessage,
        };
        
        setSettings(formattedSettings);
      } else {
        await createDefaultSettings();
      }
    } catch (err) {
      console.error('Unexpected error fetching settings:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    try {
      const settingsData = {
        default_terms_and_conditions: defaultSettings.defaultTermsAndConditions,
        company_name: defaultSettings.companyName,
        company_address: defaultSettings.companyAddress,
        company_phone: defaultSettings.companyPhone,
        company_email: defaultSettings.companyEmail,
        default_vat_rate: defaultSettings.defaultVatRate,
        default_email_subject: defaultSettings.defaultEmailSubject,
        default_email_message: defaultSettings.defaultEmailMessage,
      };
      
      const { data, error } = await supabase
        .from('settings')
        .insert(settingsData)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error creating default settings:', error);
        return;
      }
      
      const newSettings: Settings = {
        id: data.id,
        defaultTermsAndConditions: data.default_terms_and_conditions,
        companyName: data.company_name,
        companyAddress: data.company_address,
        companyPhone: data.company_phone,
        companyEmail: data.company_email,
        defaultVatRate: data.default_vat_rate,
        defaultEmailSubject: data.default_email_subject,
        defaultEmailMessage: data.default_email_message,
      };
      
      setSettings(newSettings);
    } catch (err) {
      console.error('Unexpected error creating default settings:', err);
    }
  };

  const updateSettings = async (settingsData: Partial<Settings>) => {
    try {
      if (!isAdmin) {
        toast({
          title: "Error",
          description: "Only admins can update settings",
          variant: "destructive",
        });
        return;
      }
      
      const updateData: any = {};
      
      if (settingsData.defaultTermsAndConditions !== undefined) 
        updateData.default_terms_and_conditions = settingsData.defaultTermsAndConditions;
      if (settingsData.companyName !== undefined) 
        updateData.company_name = settingsData.companyName;
      if (settingsData.companyAddress !== undefined) 
        updateData.company_address = settingsData.companyAddress;
      if (settingsData.companyPhone !== undefined) 
        updateData.company_phone = settingsData.companyPhone;
      if (settingsData.companyEmail !== undefined) 
        updateData.company_email = settingsData.companyEmail;
      if (settingsData.defaultVatRate !== undefined) 
        updateData.default_vat_rate = settingsData.defaultVatRate;
      if (settingsData.defaultEmailSubject !== undefined)
        updateData.default_email_subject = settingsData.defaultEmailSubject;
      if (settingsData.defaultEmailMessage !== undefined)
        updateData.default_email_message = settingsData.defaultEmailMessage;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('settings')
        .update(updateData)
        .eq('id', settings.id);
      
      if (error) {
        console.error('Error updating settings:', error);
        toast({
          title: "Error",
          description: "Failed to update settings",
          variant: "destructive",
        });
        return;
      }
      
      setSettings(prevSettings => ({
        ...prevSettings,
        ...settingsData
      }));
      
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    } catch (err) {
      console.error('Unexpected error updating settings:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

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
