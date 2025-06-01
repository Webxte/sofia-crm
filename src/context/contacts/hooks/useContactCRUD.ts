
import { Contact } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useContactCRUD = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const addContact = async (
    contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">,
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
  ): Promise<Contact | null> => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      console.log("useContactCRUD: Adding contact for organization:", currentOrganization.id);
      
      const newContact = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        notes: contactData.notes,
        agent_id: contactData.agentId || user?.id,
        agent_name: contactData.agentName || user?.user_metadata?.name || 'Unknown',
        organization_id: currentOrganization.id,
      };

      console.log("useContactCRUD: Inserting contact data:", newContact);

      const { data, error } = await supabase
        .from('contacts')
        .insert([newContact])
        .select()
        .single();

      if (error) {
        console.error("useContactCRUD: Error inserting contact:", error);
        throw error;
      }

      console.log("useContactCRUD: Contact inserted successfully:", data);

      const formattedContact: Contact = {
        id: data.id,
        organizationId: data.organization_id,
        fullName: data.full_name || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        position: data.position || '',
        address: data.address || '',
        source: data.source || '',
        notes: data.notes || '',
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setContacts(prev => [formattedContact, ...prev]);
      
      toast({
        title: "Success",
        description: "Contact added successfully",
      });

      return formattedContact;
    } catch (error) {
      console.error('useContactCRUD: Error adding contact:', error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContact = async (
    id: string, 
    contactData: Partial<Contact>,
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
  ): Promise<Contact | null> => {
    try {
      const updateData = {
        full_name: contactData.fullName,
        company: contactData.company,
        email: contactData.email,
        phone: contactData.phone,
        mobile: contactData.mobile,
        position: contactData.position,
        address: contactData.address,
        source: contactData.source,
        notes: contactData.notes,
        agent_id: contactData.agentId,
        agent_name: contactData.agentName,
      };

      const { data, error } = await supabase
        .from('contacts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedContact: Contact = {
        id: data.id,
        organizationId: data.organization_id,
        fullName: data.full_name || '',
        company: data.company || '',
        email: data.email || '',
        phone: data.phone || '',
        mobile: data.mobile || '',
        position: data.position || '',
        address: data.address || '',
        source: data.source || '',
        notes: data.notes || '',
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setContacts(prev => prev.map(contact => 
        contact.id === id ? formattedContact : contact
      ));

      toast({
        title: "Success",
        description: "Contact updated successfully",
      });

      return formattedContact;
    } catch (error) {
      console.error('Error updating contact:', error);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteContact = async (
    id: string,
    setContacts: React.Dispatch<React.SetStateAction<Contact[]>>
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContacts(prev => prev.filter(contact => contact.id !== id));
      
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addContact,
    updateContact,
    deleteContact,
  };
};
