
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContacts } from '@/context/ContactsContext';
import { useMeetings } from '@/context/meetings';
import { useOrders } from '@/context/OrdersContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Calendar, ListTodo, Mail, ShoppingCart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ContactDeleteDialog } from '@/components/contacts/ContactDeleteDialog';
import { ContactEmailDialog } from '@/components/contacts/ContactEmailDialog';
import { ContactMeetings, ContactOrders } from '@/components/contacts/ContactHistory';
import { useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContactById } = useContacts();
  const { getMeetingsByContactId } = useMeetings();
  const { getOrdersByContactId } = useOrders();
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  
  const contact = id ? getContactById(id) : undefined;
  const meetings = id ? getMeetingsByContactId(id) : [];
  const orders = id ? getOrdersByContactId(id) : [];
  
  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Contact not found</h2>
        <Button asChild>
          <Link to="/contacts">Back to Contacts</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{contact.company || contact.fullName || 'Contact'} | CRM</title>
      </Helmet>
      <div className="space-y-6 max-w-6xl mx-auto px-4 pb-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold truncate">{contact.company || contact.fullName}</h1>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="flex items-center space-x-1 sm:flex-none flex-1"
              onClick={() => setEmailDialogOpen(true)}
            >
              <Mail className="h-4 w-4 mr-1" />
              <span className="sm:inline hidden">Send Email</span>
              <span className="sm:hidden inline">Email</span>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="flex items-center space-x-1 sm:flex-none flex-1"
            >
              <Link to={`/meetings/new?contactId=${contact.id}`}>
                <Calendar className="h-4 w-4 mr-1" />
                <span className="sm:inline hidden">Schedule Meeting</span>
                <span className="sm:hidden inline">Meeting</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="flex items-center space-x-1 sm:flex-none flex-1"
            >
              <Link to={`/tasks/new?contactId=${contact.id}`}>
                <ListTodo className="h-4 w-4 mr-1" />
                <span className="sm:inline hidden">Create Task</span>
                <span className="sm:hidden inline">Task</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline" 
              className="flex items-center space-x-1 sm:flex-none flex-1"
            >
              <Link to={`/orders/new?contactId=${contact.id}`}>
                <ShoppingCart className="h-4 w-4 mr-1" />
                <span className="sm:inline hidden">Create Order</span>
                <span className="sm:hidden inline">Order</span>
              </Link>
            </Button>
            <Button 
              asChild 
              variant="outline"
              className="sm:flex-none flex-1"
            >
              <Link to={`/contacts/${contact.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                <span className="sm:inline hidden">Edit</span>
              </Link>
            </Button>
            <ContactDeleteDialog contact={contact} />
          </div>
        </div>
        
        <ContactEmailDialog
          contact={contact}
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {contact.company && (
                  <div>
                    <p className="text-sm text-muted-foreground">Company</p>
                    <p className="font-medium">{contact.company}</p>
                  </div>
                )}
                {contact.position && (
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium">{contact.position}</p>
                  </div>
                )}
                {contact.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium break-all">{contact.email}</p>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {contact.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">{contact.phone}</p>
                  </div>
                )}
                {contact.mobile && (
                  <div>
                    <p className="text-sm text-muted-foreground">Mobile</p>
                    <p className="font-medium">{contact.mobile}</p>
                  </div>
                )}
                {contact.address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium break-words">{contact.address}</p>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-6" />
            {contact.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <ScrollArea className="max-h-40">
                  <p className="text-sm whitespace-pre-line">{contact.notes}</p>
                </ScrollArea>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 gap-6">
          <ContactMeetings meetings={meetings} />
          <ContactOrders orders={orders} />
        </div>
      </div>
    </>
  );
};

export default ContactDetails;
