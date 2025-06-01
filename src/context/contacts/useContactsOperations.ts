
import { useContactsFetch } from "./hooks/useContactsFetch";
import { useContactCRUD } from "./hooks/useContactCRUD";
import { useContactUtils } from "./hooks/useContactUtils";

export const useContactsOperations = () => {
  const { contacts, setContacts, loading, fetchContacts } = useContactsFetch();
  const { addContact: addContactBase, updateContact: updateContactBase, deleteContact: deleteContactBase } = useContactCRUD();
  const { sendContactEmail, bulkUpdateContacts: bulkUpdateContactsBase, importContactsFromCsv: importContactsFromCsvBase } = useContactUtils();

  // Wrap CRUD operations to pass setContacts
  const addContact = (contactData: Parameters<typeof addContactBase>[0]) => 
    addContactBase(contactData, setContacts);

  const updateContact = (id: string, contactData: Parameters<typeof updateContactBase>[1]) => 
    updateContactBase(id, contactData, setContacts);

  const deleteContact = (id: string) => 
    deleteContactBase(id, setContacts);

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
