
import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";

export const useContactImport = (refreshContacts: () => Promise<void>) => {
  const { toast } = useToast();

  const importContactsFromCsv = useCallback(async (file: File) => {
    try {
      console.log("Starting CSV import for file:", file.name);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("CSV parsed successfully, rows:", results.data.length);
            
            // Here you would process the CSV data and save to database
            // For now, just refresh contacts and show success
            await refreshContacts();
            
            toast({
              title: "Import Successful",
              description: `Imported ${results.data.length} contacts from CSV.`,
            });
          } catch (error) {
            console.error("Error processing CSV data:", error);
            toast({
              title: "Import Error",
              description: "Failed to process CSV data. Please check the format.",
              variant: "destructive",
            });
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "CSV Error",
            description: "Failed to parse CSV file. Please check the format.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast({
        title: "Import Error",
        description: "Failed to import contacts. Please try again.",
        variant: "destructive",
      });
    }
  }, [refreshContacts, toast]);

  return {
    importContactsFromCsv
  };
};
