
import React, { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Settings } from "@/types";
import { transformDbToSettings } from "./utils";

export const useFetchSettings = (isAuthenticated: boolean) => {
  const [settings, setSettings] = useState<Settings>({
    id: "",
    userId: "",
    companyName: "",
    companyAddress: "",
    companyPhone: "",
    companyEmail: "",
    autoEmailEnabled: false,
    customLinks: [],
    bulkEmailTemplates: [],
    contactEmailTemplates: [],
    meetingEmailTemplates: [],
    orderEmailTemplates: [],
    privacyPolicy: "",
    termsOfService: "",
    defaultEmailSubject: "",
    defaultEmailMessage: "",
    defaultContactEmailMessage: "",
    defaultTermsAndConditions: "",
    catalogUrl: "",
    priceListUrl: "",
    emailFooter: "",
    emailSenderName: "",
    termsEnabled: false,
    defaultVatRate: 0,
    bulkEmailTemplate: "",
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [loading, setLoading] = useState(false);

  const refreshSettings = useCallback(async () => {
    if (!isAuthenticated) {
      console.log("useFetchSettings: Not authenticated, skipping settings fetch");
      return;
    }
    
    setLoading(true);
    try {
      console.log("useFetchSettings: Fetching settings...");
      const { data, error } = await supabase
        .from("settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("useFetchSettings: Error fetching settings:", error);
        return;
      }

      if (data) {
        console.log("useFetchSettings: Settings fetched successfully:", data);
        const transformedSettings = transformDbToSettings(data);
        setSettings(transformedSettings);
      } else {
        console.log("useFetchSettings: No settings found, using defaults");
      }
    } catch (err) {
      console.error("useFetchSettings: Exception during settings fetch:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return { settings, setSettings, loading, refreshSettings };
};
