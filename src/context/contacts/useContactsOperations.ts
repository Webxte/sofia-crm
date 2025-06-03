
import { useContactsFetch } from "./hooks/useContactsFetch";
import { useContactCRUD } from "./hooks/useContactCRUD";
import { useContactUtils } from "./hooks/useContactUtils";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useContactsOperations = () => {
  const { contacts, setContacts, loading, fetchContacts } = useContactsFetch();
  const { addContact: addContactBase, updateContact: updateContactBase, deleteContact: deleteContactBase } = useContactCRUD();
  const { sendContactEmail, bulkUpdateContacts: bulkUpdateContactsBase, importContactsFromCsv: importContactsFromCsvBase } = useContactUtils();
  const { currentOrganization } = useOrganizations();

  // Wrap CRUD operations to pass setContacts
  const addContact = async (contactData: Parameters<typeof addContactBase>[0]) => {
    if (!currentOrganization) {
      console.error("Cannot add contact: No organization selected");
      throw new Error("No organization selected");
    }
    
    // Ensure organization ID is set
    const contactWithOrg = {
      ...contactData,
      organizationId: currentOrganization.id
    };
    
    console.log("Adding contact with organization:", contactWithOrg);
    const result = await addContactBase(contactWithOrg);
    await fetchContacts(); // Refresh contacts after adding
    return result;
  };

  const updateContact = async (id: string, contactData: Parameters<typeof updateContactBase>[1]) => {
    const result = await updateContactBase(id, contactData);
    await fetchContacts(); // Refresh contacts after updating
    return result;
  };

  const deleteContact = async (id: string) => {
    const result = await deleteContactBase(id);
    if (result) {
      await fetchContacts(); // Refresh contacts after deleting
    }
    return result;
  };

  const refreshContacts = async () => {
    await fetchContacts();
  };

  const bulkUpdateContacts = (contactIds: string[], updateData: Parameters<typeof bulkUpdateContactsBase>[1]) =>
    bulkUpdateContactsBase(contactIds, updateData, refreshContacts);

  const importContactsFromCsv = (file: File) =>
    importContactsFromCsvBase(file, refreshContacts);

  return {
    contacts,
    loading,
    addContact,
    updateContact,
    deleteContact,
    refreshContacts,
    fetchContacts,
    sendContactEmail,
    bulkUpdateContacts,
    importContactsFromCsv,
  };
};
