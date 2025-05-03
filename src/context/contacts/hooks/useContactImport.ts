
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useContactImport = (refreshContacts: () => Promise<void>) => {
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();

  const importContactsFromCsv = useCallback(async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          if (!event.target || !event.target.result) {
            reject(new Error("Failed to read file"));
            return;
          }
          
          if (!currentOrganization) {
            reject(new Error("No organization selected"));
            return;
          }
          
          const csvData = event.target.result as string;
          const lines = csvData.split("\n");
          
          // Extract headers and parse data
          const headers = lines[0].split(",").map(header => header.trim().toLowerCase());
          
          const contacts = [];
          
          for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(",");
            const contact: Record<string, any> = {};
            
            for (let j = 0; j < headers.length; j++) {
              contact[headers[j]] = values[j]?.trim() || null;
            }
            
            // Map CSV fields to database columns
            const contactData = {
              full_name: contact.fullname || contact.full_name || contact.name || null,
              email: contact.email || null,
              phone: contact.phone || null,
              mobile: contact.mobile || contact.cell || null,
              address: contact.address || null,
              company: contact.company || contact.organization || null,
              position: contact.position || contact.title || contact.job_title || null,
              notes: contact.notes || null,
              source: contact.source || "CSV Import",
              organization_id: currentOrganization.id
              // Will be added by RLS or the server function
            };
            
            contacts.push(contactData);
          }
          
          // Batch insert to Supabase
          if (contacts.length > 0) {
            const { error } = await supabase
              .from('contacts')
              .insert(contacts);
            
            if (error) {
              console.error('Error importing contacts:', error);
              reject(error);
              return;
            }
            
            await refreshContacts();
            resolve();
          } else {
            reject(new Error("No valid contacts found in CSV"));
          }
        } catch (error) {
          console.error('Error processing CSV:', error);
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      
      reader.readAsText(file);
    }).catch(error => {
      toast({
        title: "Error",
        description: "Failed to import contacts: " + error.message,
        variant: "destructive",
      });
      throw error;
    });
  }, [currentOrganization, refreshContacts, toast]);

  return {
    importContactsFromCsv
  };
};
