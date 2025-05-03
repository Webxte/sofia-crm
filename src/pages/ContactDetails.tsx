
import { useParams, useNavigate } from 'react-router-dom';
import { useContacts } from '@/context/ContactsContext';
import { Helmet } from 'react-helmet-async';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContactActions } from '@/components/contacts/details/ContactActions';
import { ContactInformation } from '@/components/contacts/details/ContactInformation';
import { ContactMetadata } from '@/components/contacts/details/ContactMetadata';
import { ContactNotFound } from '@/components/contacts/details/ContactNotFound';
import { ContactDeleteDialog } from '@/components/contacts/ContactDeleteDialog';
import { ContactEmailDialog } from '@/components/contacts/ContactEmailDialog';
import ContactHistory from '@/components/contacts/ContactHistory';

const ContactDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getContactById, deleteContact } = useContacts();
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  // If no id provided or id not found, return to contacts page
  const contact = id ? getContactById(id) : undefined;
  
  if (!contact) {
    // This will prevent an error if contact is not found
    setTimeout(() => navigate('/contacts'), 0);
    return <ContactNotFound />;
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteContact(contact.id);
      toast({
        title: "Contact deleted",
        description: `${contact.fullName || 'Contact'} has been deleted successfully.`,
      });
      navigate('/contacts');
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
    }
  };
  
  const formatLocation = () => {
    if (!contact.address) return null;
    return contact.address.split(',').map((part, i) => (
      <span key={i} className="block">{part.trim()}</span>
    ));
  };

  return (
    <>
      <Helmet>
        <title>{contact.fullName || contact.company || 'Contact'} | CRM</title>
      </Helmet>
      
      <ScrollArea className="h-[calc(100vh-5rem)] md:h-[calc(100vh-3.5rem)]">
        <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
          {/* Header with navigation and actions */}
          <ContactActions 
            contact={contact}
            onDelete={() => setShowDeleteDialog(true)}
            onEmail={() => setShowEmailDialog(true)}
          />
          
          {/* Contact details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main info */}
            <ContactInformation 
              contact={contact}
              formatLocation={formatLocation}
            />
            
            {/* Stats and Metadata */}
            <div className="space-y-6">
              <ContactMetadata contact={contact} />
            </div>
          </div>
          
          {/* Contact history (activities, orders, etc.) */}
          <ContactHistory contact={contact} />
        </div>
      </ScrollArea>
      
      {/* Dialogs */}
      <ContactDeleteDialog
        contact={contact}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        contactName={contact.fullName || contact.company || 'this contact'}
      />
      
      <ContactEmailDialog
        open={showEmailDialog}
        onOpenChange={setShowEmailDialog}
        contact={contact}
      />
    </>
  );
};

export default ContactDetails;
