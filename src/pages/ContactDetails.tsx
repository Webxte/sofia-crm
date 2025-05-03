import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useContacts } from '@/context/ContactsContext';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, ArrowLeft, Trash, Plus, Clock, Mail } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ContactDeleteDialog } from '@/components/contacts/ContactDeleteDialog';
import { ContactEmailDialog } from '@/components/contacts/ContactEmailDialog';
import ContactHistory from '@/components/contacts/ContactHistory';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    return (
      <div className="p-6">
        <h1 className="text-xl font-bold mb-6">Contact not found</h1>
        <Button variant="outline" onClick={() => navigate('/contacts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contacts
        </Button>
      </div>
    );
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

  const handleScheduleMeeting = () => {
    navigate(`/meetings/new?contactId=${contact.id}`);
  };

  const handleCreateTask = () => {
    navigate(`/tasks/new?contactId=${contact.id}`);
  };

  const handleCreateOrder = () => {
    navigate(`/orders/new?contactId=${contact.id}`);
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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/contacts')}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowEmailDialog(true)}
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate(`/contacts/${contact.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
          
          {/* Contact details */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main info */}
            <Card className="lg:col-span-2">
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Header with name/company */}
                  <div>
                    <h1 className="text-2xl font-bold">
                      {contact.fullName || 'Unnamed Contact'}
                    </h1>
                    {contact.company && (
                      <p className="text-lg text-muted-foreground mt-1">
                        {contact.company}
                      </p>
                    )}
                    {contact.position && (
                      <p className="text-sm text-muted-foreground">
                        {contact.position}
                      </p>
                    )}
                    
                    {contact.source && (
                      <div className="mt-2">
                        {contact.source.split(',').map((src) => (
                          <Badge key={src.trim()} variant="outline" className="mr-1">
                            {src.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Contact information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Communication */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Contact Information</h3>
                      {(contact.email || contact.phone || contact.mobile) ? (
                        <div className="space-y-2">
                          {contact.email && (
                            <p className="text-sm">
                              <span className="text-muted-foreground mr-2">Email:</span>
                              <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                                {contact.email}
                              </a>
                            </p>
                          )}
                          {contact.phone && (
                            <p className="text-sm">
                              <span className="text-muted-foreground mr-2">Phone:</span>
                              <a href={`tel:${contact.phone}`} className="text-primary hover:underline">
                                {contact.phone}
                              </a>
                            </p>
                          )}
                          {contact.mobile && (
                            <p className="text-sm">
                              <span className="text-muted-foreground mr-2">Mobile:</span>
                              <a href={`tel:${contact.mobile}`} className="text-primary hover:underline">
                                {contact.mobile}
                              </a>
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No contact information provided</p>
                      )}
                    </div>
                    
                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Address</h3>
                      {contact.address ? (
                        <p className="text-sm">
                          {formatLocation()}
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">No address provided</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Notes */}
                  {contact.notes && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <h3 className="font-medium">Notes</h3>
                        <p className="text-sm whitespace-pre-line">{contact.notes}</p>
                      </div>
                    </>
                  )}
                  
                  <div className="pt-4">
                    <h3 className="font-medium mb-3">Actions</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={handleScheduleMeeting} variant="outline" size="sm">
                        <Clock className="h-4 w-4 mr-2" /> Schedule Meeting
                      </Button>
                      <Button onClick={handleCreateTask} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Create Task
                      </Button>
                      <Button onClick={handleCreateOrder} variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" /> Create Order
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats and Metadata */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Contact Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(contact.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Last Updated</span>
                      <span>{new Date(contact.updatedAt).toLocaleDateString()}</span>
                    </div>
                    {contact.agentName && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Assigned To</span>
                        <span>{contact.agentName}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
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
