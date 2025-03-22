
import { useParams, Navigate } from "react-router-dom";
import { useContacts } from "@/context/ContactsContext";
import ContactForm from "@/components/contacts/ContactForm";

const EditContact = () => {
  const { id } = useParams();
  const { getContactById } = useContacts();
  
  const contact = id ? getContactById(id) : undefined;
  
  if (!contact) {
    return <Navigate to="/contacts" replace />;
  }
  
  return <ContactForm contact={contact} isEditing />;
};

export default EditContact;
