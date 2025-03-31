
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useContacts } from '@/context/ContactsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash2, Calendar, ListTodo } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ContactDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getContactById, deleteContact } = useContacts();
  
  const contact = id ? getContactById(id) : undefined;
  
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
  
  const handleDelete = async () => {
    if (id) {
      await deleteContact(id);
      navigate('/contacts');
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{contact.company || contact.fullName || 'Contact'} | CRM</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/contacts">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{contact.company || contact.fullName}</h1>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline" className="flex items-center space-x-1">
              <Link to={`/meetings/new?contactId=${contact.id}`}>
                <Calendar className="h-4 w-4 mr-1" />
                Schedule Meeting
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex items-center space-x-1">
              <Link to={`/tasks/new?contactId=${contact.id}`}>
                <ListTodo className="h-4 w-4 mr-1" />
                Create Task
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to={`/contacts/${contact.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this contact and all related data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
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
                    <p className="font-medium">{contact.email}</p>
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
                    <p className="font-medium">{contact.address}</p>
                  </div>
                )}
              </div>
            </div>
            <Separator className="my-6" />
            {contact.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{contact.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ContactDetails;
