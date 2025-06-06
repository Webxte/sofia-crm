
import { useState } from "react";
import { Contact } from "@/types";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useContactUtils = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendContactEmail = async (contactId: string, emailData: any) => {
    try {
      setLoading(true);
      
      console.log("Sending contact email:", { contactId, emailData });
      
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          contactId,
          ...emailData
        }
      });
      
      if (error) {
        console.error("Error from send-contact-email function:", error);
        throw error;
      }
      
      console.log("Contact email sent successfully:", data);
      
      toast({
        title: "Email Sent",
        description: "Email sent successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending contact email:", error);
      toast({
        title: "Error",
        description: "Failed to send email",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const bulkUpdateContacts = async (
    contactIds: string[], 
    updateData: Partial<Contact>,
    refreshCallback: () => Promise<void>
  ) => {
    try {
      setLoading(true);
      
      // Convert Contact type to database format
      const dbUpdateData: any = {};
      if (updateData.fullName !== undefined) dbUpdateData.full_name = updateData.fullName;
      if (updateData.company !== undefined) dbUpdateData.company = updateData.company;
      if (updateData.email !== undefined) dbUpdateData.email = updateData.email;
      if (updateData.phone !== undefined) dbUpdateData.phone = updateData.phone;
      if (updateData.mobile !== undefined) dbUpdateData.mobile = updateData.mobile;
      if (updateData.position !== undefined) dbUpdateData.position = updateData.position;
      if (updateData.address !== undefined) dbUpdateData.address = updateData.address;
      if (updateData.source !== undefined) dbUpdateData.source = updateData.source;
      if (updateData.notes !== undefined) dbUpdateData.notes = updateData.notes;
      
      dbUpdateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('contacts')
        .update(dbUpdateData)
        .in('id', contactIds);
      
      if (error) {
        console.error('Error bulk updating contacts:', error);
        throw error;
      }
      
      await refreshCallback();
      
      toast({
        title: "Success",
        description: `Updated ${contactIds.length} contacts`,
      });
    } catch (error) {
      console.error('Error in bulkUpdateContacts:', error);
      toast({
        title: "Error",
        description: "Failed to update contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const importContactsFromCsv = async (file: File, refreshCallback: () => Promise<void>) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      const text = await file.text();
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          try {
            const contacts = results.data.map((row: any) => ({
              full_name: row.fullName || row.full_name || row.name || '',
              company: row.company || '',
              email: row.email || '',
              phone: row.phone || '',
              mobile: row.mobile || '',
              position: row.position || row.title || '',
              address: row.address || '',
              source: row.source || user.name || '',
              notes: row.notes || '',
              agent_id: user.id,
              agent_name: user.name || user.email || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
            
            const { error } = await supabase
              .from('contacts')
              .insert(contacts);
            
            if (error) {
              console.error('Error importing contacts:', error);
              throw error;
            }
            
            await refreshCallback();
            
            toast({
              title: "Success",
              description: `Imported ${contacts.length} contacts`,
            });
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast({
              title: "Error",
              description: "Failed to import contacts from CSV",
              variant: "destructive",
            });
          } finally {
            setLoading(false);
          }
        },
        error: (error) => {
          console.error('CSV parsing error:', error);
          toast({
            title: "Error",
            description: "Failed to parse CSV file",
            variant: "destructive",
          });
          setLoading(false);
        }
      });
    } catch (error) {
      console.error('Error in importContactsFromCsv:', error);
      toast({
        title: "Error",
        description: "Failed to import contacts",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return {
    sendContactEmail,
    bulkUpdateContacts,
    importContactsFromCsv,
    loading
  };
};
