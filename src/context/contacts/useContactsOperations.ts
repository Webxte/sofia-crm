
import { useContactsFetch } from "./hooks/useContactsFetch";
import { useContactCRUD } from "./hooks/useContactCRUD";
import { useContactUtils } from "./hooks/useContactUtils";

export const useContactsOperations = () => {
  const { contacts, setContacts, loading, fetchContacts } = useContactsFetch();
  const { addContact: addContactBase, updateContact: updateContactBase, deleteContact: deleteContactBase } = useContactCRUD();
  const { sendContactEmail, bulkUpdateContacts: bulkUpdateContactsBase, importContactsFromCsv: importContactsFromCsvBase } = useContactUtils();

  // Wrap CRUD operations to pass current showAll state
  const addContact = async (contactData: Parameters<typeof addContactBase>[0]) => {
    console.log("Adding contact:", contactData);
    const result = await addContactBase(contactData);
    if (result) {
      // Add the new contact to the current list instead of refetching
      setContacts(prev => [result, ...prev]);
    }
    return result;
  };

  const updateContact = async (id: string, contactData: Parameters<typeof updateContactBase>[1]) => {
    const result = await updateContactBase(id, contactData);
    if (result) {
      // Update the contact in the current list
      setContacts(prev => prev.map(contact => 
        contact.id === id ? result : contact
      ));
    }
    return result;
  };

  const deleteContact = async (id: string) => {
    const result = await deleteContactBase(id);
    if (result) {
      // Remove the contact from the current list
      setContacts(prev => prev.filter(contact => contact.id !== id));
    }
    return result;
  };

  const refreshContacts = async (showAll: boolean = false) => {
    await fetchContacts(showAll);
  };

  const bulkUpdateContacts = (contactIds: string[], updateData: Parameters<typeof bulkUpdateContactsBase>[1]) =>
    bulkUpdateContactsBase(contactIds, updateData, () => refreshContacts(false));

  const importContactsFromCsv = (file: File) =>
    importContactsFromCsvBase(file, () => refreshContacts(false));

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
