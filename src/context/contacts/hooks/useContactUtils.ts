
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Papa from "papaparse";
import { Contact } from "@/types";

export const useContactUtils = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendContactEmail = async (contactId: string, subject: string, message: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          contactId,
          subject,
          message
        }
      });

      if (error) throw error;

      toast({
        title: "Email Sent",
        description: "Contact email sent successfully",
      });

      return data;
    } catch (error) {
      console.error("Error sending contact email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateContacts = async (
    contactIds: string[],
    updateData: Partial<Contact>,
    refreshCallback?: () => Promise<void>
  ) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('contacts')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .in('id', contactIds);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Updated ${contactIds.length} contacts`,
      });

      if (refreshCallback) {
        await refreshCallback();
      }
    } catch (error) {
      console.error("Error bulk updating contacts:", error);
      toast({
        title: "Error",
        description: "Failed to update contacts",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const importContactsFromCsv = async (file: File, refreshCallback?: () => Promise<void>) => {
    try {
      setLoading(true);
      
      Papa.parse(file, {
        header: true,
        complete: async (results) => {
          try {
            const contacts = results.data.map((row: any) => ({
              full_name: row['Full Name'] || row['Name'] || '',
              company: row['Company'] || '',
              email: row['Email'] || '',
              phone: row['Phone'] || '',
              mobile: row['Mobile'] || '',
              position: row['Position'] || '',
              address: row['Address'] || '',
              source: row['Source'] || 'CSV Import',
              notes: row['Notes'] || '',
            })).filter(contact => contact.full_name || contact.email);

            const { error } = await supabase
              .from('contacts')
              .insert(contacts);

            if (error) throw error;

            toast({
              title: "Import Successful",
              description: `Imported ${contacts.length} contacts`,
            });

            if (refreshCallback) {
              await refreshCallback();
            }
          } catch (error) {
            console.error("Error importing contacts:", error);
            toast({
              title: "Import Failed",
              description: "Failed to import contacts from CSV",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          console.error("CSV parsing error:", error);
          toast({
            title: "Parse Error",
            description: "Failed to parse CSV file",
            variant: "destructive",
          });
          setLoading(false);
        }
      });
    } catch (error) {
      console.error("Error reading CSV file:", error);
      toast({
        title: "File Error",
        description: "Failed to read CSV file",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    sendContactEmail,
    bulkUpdateContacts,
    importContactsFromCsv,
    loading,
  };
};
