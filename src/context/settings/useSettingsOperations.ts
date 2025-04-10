
import { useState } from "react";
import { Settings } from "@/types";
import { DEFAULT_SETTINGS } from "./constants";
import { useFetchSettings } from "./useFetchSettings";
import { useUpdateSettings } from "./useUpdateSettings";

export { DEFAULT_SETTINGS } from "./constants";

export const useSettingsOperations = (isAuthenticated: boolean, isAdmin: boolean) => {
  const { 
    settings, 
    setSettings,
    loading: fetchLoading, 
    refreshSettings 
  } = useFetchSettings(isAuthenticated);
  
  const { 
    updateSettings, 
    loading: updateLoading 
  } = useUpdateSettings(isAuthenticated, isAdmin, refreshSettings, setSettings);
  
  const loading = fetchLoading || updateLoading;

  return { settings, loading, refreshSettings, updateSettings };
};
