
import { useCallback } from "react";
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import Papa from "papaparse";

export const useContactUtils = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const sendContactEmail = async (contactId: string, emailData: any): Promise<boolean> => {
    // Implementation for sending contact emails would go here
    console.log("Contact email not yet implemented");
    return false;
  };

  const bulkUpdateContacts = async (
    contactIds: string[], 
    updateData: Partial<Contact>,
    refreshContacts: () => Promise<void>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .update({
          agent_id: updateData.agentId,
          agent_name: updateData.agentName,
          source: updateData.source,
        })
        .in('id', contactIds);

      if (error) throw error;

      // Refresh contacts to get updated data
      await refreshContacts();
      
      toast({
        title: "Success",
        description: `Updated ${contactIds.length} contacts`,
      });

      return true;
    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      toast({
        title: "Error",
        description: "Failed to update contacts",
        variant: "destructive",
      });
      return false;
    }
  };

  const importContactsFromCsv = useCallback(async (
    file: File,
    refreshContacts: () => Promise<void>
  ) => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("Starting CSV import for file:", file.name);
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            console.log("CSV parsed successfully, rows:", results.data.length);
            
            const contactsToInsert = (results.data as any[]).map(row => ({
              full_name: row.full_name || row.name || '',
              company: row.company || '',
              email: row.email || '',
              phone: row.phone || '',
              mobile: row.mobile || '',
              position: row.position || '',
              address: row.address || '',
              source: row.source || file.name.replace('.csv', ''),
              notes: row.notes || '',
              agent_id: user?.id,
              agent_name: user?.user_metadata?.name || 'Unknown',
              organization_id: currentOrganization.id,
            }));

            const { error } = await supabase
              .from('contacts')
              .insert(contactsToInsert);

            if (error) throw error;

            await refreshContacts();
            
            toast({
              title: "Import Successful",
              description: `Imported ${contactsToInsert.length} contacts from CSV.`,
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
  }, [currentOrganization, user, toast]);

  return {
    sendContactEmail,
    bulkUpdateContacts,
    importContactsFromCsv,
  };
};
