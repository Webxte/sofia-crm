
import { useContactsFetch } from "./hooks/useContactsFetch";
import { useContactCRUD } from "./hooks/useContactCRUD";
import { useContactUtils } from "./hooks/useContactUtils";

export const useContactsOperations = () => {
  const { contacts, setContacts, loading, fetchContacts } = useContactsFetch();
  const { addContact: addContactBase, updateContact: updateContactBase, deleteContact: deleteContactBase } = useContactCRUD();
  const { sendContactEmail, bulkUpdateContacts: bulkUpdateContactsBase, importContactsFromCsv: importContactsFromCsvBase } = useContactUtils();

  // Wrap CRUD operations to pass setContacts
  const addContact = async (contactData: Parameters<typeof addContactBase>[0]) => {
    console.log("Adding contact:", contactData);
    const result = await addContactBase(contactData);
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
