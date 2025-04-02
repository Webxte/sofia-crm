
import { useState } from "react";
import { Settings } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const DEFAULT_SETTINGS: Settings = {
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

export const useSettingsOperations = (isAuthenticated: boolean, isAdmin: boolean) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const refreshSettings = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setSettings(DEFAULT_SETTINGS);
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
        // TypeScript is unaware of the new fields, so we need to type assert
        const dbData = data as any;
        
        const formattedSettings: Settings = {
          id: dbData.id,
          defaultTermsAndConditions: dbData.default_terms_and_conditions || DEFAULT_SETTINGS.defaultTermsAndConditions,
          companyName: dbData.company_name || DEFAULT_SETTINGS.companyName,
          companyAddress: dbData.company_address || DEFAULT_SETTINGS.companyAddress,
          companyPhone: dbData.company_phone || DEFAULT_SETTINGS.companyPhone,
          companyEmail: dbData.company_email || DEFAULT_SETTINGS.companyEmail,
          defaultVatRate: dbData.default_vat_rate || DEFAULT_SETTINGS.defaultVatRate,
          defaultEmailSubject: dbData.default_email_subject || DEFAULT_SETTINGS.defaultEmailSubject,
          defaultEmailMessage: dbData.default_email_message || DEFAULT_SETTINGS.defaultEmailMessage,
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
        default_terms_and_conditions: DEFAULT_SETTINGS.defaultTermsAndConditions,
        company_name: DEFAULT_SETTINGS.companyName,
        company_address: DEFAULT_SETTINGS.companyAddress,
        company_phone: DEFAULT_SETTINGS.companyPhone,
        company_email: DEFAULT_SETTINGS.companyEmail,
        default_vat_rate: DEFAULT_SETTINGS.defaultVatRate,
        default_email_subject: DEFAULT_SETTINGS.defaultEmailSubject,
        default_email_message: DEFAULT_SETTINGS.defaultEmailMessage,
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
      
      // TypeScript is unaware of the new fields, so we need to type assert
      const dbData = data as any;
      
      const newSettings: Settings = {
        id: dbData.id,
        defaultTermsAndConditions: dbData.default_terms_and_conditions,
        companyName: dbData.company_name,
        companyAddress: dbData.company_address,
        companyPhone: dbData.company_phone,
        companyEmail: dbData.company_email,
        defaultVatRate: dbData.default_vat_rate,
        defaultEmailSubject: dbData.default_email_subject,
        defaultEmailMessage: dbData.default_email_message,
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

  return {
    settings,
    loading,
    refreshSettings,
    updateSettings
  };
};
