
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
      console.log("Prepared DB updates:", dbUpdates);
      
      const { error, data } = await supabase
        .from("settings")
        .update(dbUpdates)
        .eq("id", "1") // Using a string here instead of a number
        .select();

      if (error) {
        console.error("Error updating settings:", error);
        toast({
          title: "Error",
          description: "Failed to update settings.",
          variant: "destructive",
        });
      } else {
        console.log("Settings updated successfully:", data);
        toast({
          title: "Success",
          description: "Settings updated successfully!",
        });
        
        // Update local state with the changes 
        setSettings(prevSettings => ({
          ...prevSettings,
          ...updates
        }));
        
        // Refresh settings from the server to ensure data consistency
        await refreshSettings();
      }
    } catch (err) {
      console.error("Exception during settings update:", err);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return { updateSettings, loading };
};
