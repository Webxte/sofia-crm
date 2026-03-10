
import { useParams, Navigate } from "react-router-dom";
import { useContacts } from "@/context/contacts/ContactsContext";
import ContactForm from "@/components/contacts/ContactForm";

const EditContact = () => {
  const { id } = useParams();
  const { getContactById } = useContacts();
  
  const contact = id ? getContactById(id) : undefined;
  
  if (!contact) {
    return <Navigate to="/contacts" replace />;
  }
  
  const navigate = useNavigate();
  
  return (
    <ContactForm 
      contact={contact} 
      isEditing={true} 
      onContactCreated={() => navigate("/contacts")}
    />
  );
};

export default EditContact;
