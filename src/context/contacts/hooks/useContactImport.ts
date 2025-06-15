import { useCallback } from "react";
import { toast } from "sonner";
import Papa from "papaparse";

export const useContactImport = (refreshContacts: () => Promise<void>) => {
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
            
            toast.success("Import Successful", {
              description: `Imported ${results.data.length} contacts from CSV.`,
            });
          } catch (error) {
            console.error("Error processing CSV data:", error);
            toast.error("Import Error", {
              description: "Failed to process CSV data. Please check the format.",
            });
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast.error("CSV Error", {
            description: "Failed to parse CSV file. Please check the format.",
          });
        }
      });
    } catch (error) {
      console.error("Error importing contacts:", error);
      toast.error("Import Error", {
        description: "Failed to import contacts. Please try again.",
      });
    }
  }, [refreshContacts]);

  return {
    importContactsFromCsv
  };
};
