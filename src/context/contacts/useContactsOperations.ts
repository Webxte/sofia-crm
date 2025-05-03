
import { useCallback } from "react";
import { Contact } from "@/types";
import { useContactsFetch } from "./hooks/useContactsFetch";
import { useContactCRUD } from "./hooks/useContactCRUD";
import { useContactImport } from "./hooks/useContactImport";

export const useContactsOperations = () => {
  const { contacts, loading, fetchContacts, setContacts } = useContactsFetch();
  const { addContact, updateContact, deleteContact } = useContactCRUD(setContacts);
  
  const refreshContacts = useCallback(async () => {
    return await fetchContacts();
  }, [fetchContacts]);
  
  const { importContactsFromCsv } = useContactImport(refreshContacts);

  return {
    contacts,
    loading,
    fetchContacts,
    refreshContacts,
    addContact,
    updateContact,
    deleteContact,
    importContactsFromCsv
  };
};
