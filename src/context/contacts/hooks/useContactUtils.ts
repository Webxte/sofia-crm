import { useState } from "react";
import { Contact } from "@/types";
import { toast } from "sonner";
import Papa from "papaparse";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export const useContactUtils = () => {
  const [loading, setLoading] = useState(false);
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
      
      toast.success("Email Sent", {
        description: "Email sent successfully",
      });
      
      return true;
    } catch (error) {
      console.error("Error sending contact email:", error);
      toast.error("Error", {
        description: "Failed to send email",
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
      
      toast.success("Success", {
        description: `Updated ${contactIds.length} contacts`,
      });
    } catch (error) {
      console.error('Error in bulkUpdateContacts:', error);
      toast.error("Error", {
        description: "Failed to update contacts",
      });
    } finally {
      setLoading(false);
    }
  };

  const previewCsvImport = async (file: File, defaultSource?: string): Promise<{
    toImport: any[];
    duplicates: { row: any; matchedOn: string }[];
  } | null> => {
    if (!user) {
      toast.error("Error", { description: "User not authenticated" });
      return null;
    }

    try {
      setLoading(true);
      const text = await file.text();

      return await new Promise((resolve, reject) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
            try {
              const rows = results.data.map((row: any) => ({
                full_name: row.fullName || row.full_name || row.name || '',
                company: row.company || '',
                email: row.email || '',
                phone: row.phone || '',
                mobile: row.mobile || '',
                position: row.position || row.title || '',
                address: row.address || '',
                source: row.source || defaultSource || user.name || '',
                notes: row.notes || '',
                agent_id: user.id,
                agent_name: user.name || user.email || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }));

              // Fetch existing contacts for duplicate checking
              const { data: existing } = await supabase
                .from('contacts')
                .select('email, full_name, company');

              const existingEmails = new Set(
                (existing || []).map(c => c.email?.toLowerCase().trim()).filter(Boolean)
              );
              const existingNameCompany = new Set(
                (existing || []).map(c => `${c.full_name?.toLowerCase().trim()}|${c.company?.toLowerCase().trim()}`)
              );

              const toImport: any[] = [];
              const duplicates: { row: any; matchedOn: string }[] = [];

              for (const row of rows) {
                const email = row.email?.toLowerCase().trim();
                const nameCompany = `${row.full_name?.toLowerCase().trim()}|${row.company?.toLowerCase().trim()}`;

                if (email && existingEmails.has(email)) {
                  duplicates.push({ row, matchedOn: `email: ${row.email}` });
                } else if (!email && existingNameCompany.has(nameCompany)) {
                  duplicates.push({ row, matchedOn: `name + company: ${row.full_name} / ${row.company}` });
                } else {
                  toImport.push(row);
                }
              }

              resolve({ toImport, duplicates });
            } catch (error) {
              reject(error);
            } finally {
              setLoading(false);
            }
          },
          error: (error) => {
            setLoading(false);
            reject(error);
          },
        });
      });
    } catch (error) {
      console.error('Error in previewCsvImport:', error);
      toast.error("Error", { description: "Failed to parse CSV file" });
      setLoading(false);
      return null;
    }
  };

  const executeImport = async (contacts: any[], refreshCallback: () => Promise<void>) => {
    try {
      setLoading(true);
      const { error } = await supabase.from('contacts').insert(contacts);
      if (error) throw error;
      await refreshCallback();
      toast.success("Import complete", {
        description: `${contacts.length} contact${contacts.length !== 1 ? 's' : ''} imported`,
      });
    } catch (error) {
      console.error('Error in executeImport:', error);
      toast.error("Error", { description: "Failed to import contacts" });
    } finally {
      setLoading(false);
    }
  };

  // Keep for backwards compatibility
  const importContactsFromCsv = async (file: File, refreshCallback: () => Promise<void>) => {
    const preview = await previewCsvImport(file);
    if (preview) await executeImport(preview.toImport, refreshCallback);
  };

  return {
    sendContactEmail,
    bulkUpdateContacts,
    importContactsFromCsv,
    previewCsvImport,
    executeImport,
    loading
  };
};
