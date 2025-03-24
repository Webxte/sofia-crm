
import { Contact } from "@/types";

export interface ContactsContextType {
  contacts: Contact[];
  loading: boolean;
  addContact: (contact: Omit<Contact, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateContact: (id: string, contact: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  getContactsByAgentId: (agentId: string) => Contact[];
  searchContacts: (query: string) => Contact[];
  refreshContacts: () => Promise<void>;
}
