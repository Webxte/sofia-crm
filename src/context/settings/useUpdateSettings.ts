
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "@/types";
import { prepareSettingsForDb } from "./utils";

export const useUpdateSettings = (
  isAuthenticated: boolean, 
  isAdmin: boolean, 
  refreshSettings: () => Promise<void>,
  setSettings: React.Dispatch<React.SetStateAction<Settings>>
) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!isAuthenticated || !isAdmin) {
      toast({
        title: "Unauthorized",
        description: "You do not have permission to update settings.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log("Updating settings with:", updates);
      
      // Prepare database update object
      const dbUpdates = prepareSettingsForDb(updates);
      
      const { error } = await supabase
        .from("settings")
        .update(dbUpdates)
        .eq("id", "1"); // Using a string here instead of a number

      if (error) {
        console.error("Error updating settings:", error);
        toast({
          title: "Error",
          description: "Failed to update settings.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Settings updated successfully!",
        });
        
        // Update local state with the changes before refreshing from the server
        setSettings(prevSettings => ({
          ...prevSettings,
          ...updates
        }));
        
        await refreshSettings(); // Refresh settings after update to ensure data consistency
      }
    } finally {
      setLoading(false);
    }
  };
  
  return { updateSettings, loading };
};
