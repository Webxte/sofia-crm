
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useMeetings } from '@/context/meetings';
import { useContacts } from '@/context/contacts/ContactsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Calendar, Trash2, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';
import { ContactEmailDialog } from '@/components/contacts/ContactEmailDialog';
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

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getMeetingById, deleteMeeting } = useMeetings();
  const { getContactById } = useContacts();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  
  const meeting = id ? getMeetingById(id) : undefined;
  const contact = meeting?.contactId ? getContactById(meeting.contactId) : undefined;
  
  if (!meeting) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Meeting not found</h2>
        <Button asChild>
          <Link to="/meetings">Back to Meetings</Link>
        </Button>
      </div>
    );
  }
  
  const handleDelete = async () => {
    await deleteMeeting(meeting.id);
    navigate('/meetings');
  };
  
  // Create a friendly description for the meeting title using contact information
  const meetingTitle = contact ? (contact.company || contact.fullName || 'Unknown Contact') : 'Meeting (No contact specified)';
  
  const handleEmailContact = () => {
    if (contact && contact.email) {
      setShowEmailDialog(true);
    } else {
      // Handle case where contact has no email
      // You could show a toast notification here
      console.error("Contact has no email address");
    }
  };
  
  return (
    <>
      <Helmet>
        <title>{meetingTitle} | Meeting | CRM</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/meetings">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{meetingTitle}</h1>
            <Badge variant="outline">
              {meeting.type === 'meeting' ? 'In Person' : meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
            </Badge>
          </div>
          <div className="flex space-x-2">
            {contact && contact.email && (
              <Button variant="outline" onClick={handleEmailContact}>
                <Mail className="h-4 w-4 mr-1" />
                Email Contact
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={`/meetings/${meeting.id}/edit`}>
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
                    This will permanently delete this meeting and all related data.
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
            <CardTitle>Meeting Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date & Time</p>
                    <p className="font-medium">
                      {format(new Date(meeting.date), 'PPP')} at {meeting.time}
                    </p>
                  </div>
                </div>
                
                {meeting.location && (
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{meeting.location}</p>
                  </div>
                )}
                
                {meeting.contactId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Contact</p>
                    <p className="font-medium">
                      <Link to={`/contacts/${meeting.contactId}`} className="text-blue-600 hover:underline">
                        View Contact
                      </Link>
                    </p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {meeting.followUpScheduled && (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Follow Up</p>
                      <p className="font-medium">Required</p>
                    </div>
                    
                    {meeting.followUpDate && (
                      <div>
                        <p className="text-sm text-muted-foreground">Follow Up Date</p>
                        <p className="font-medium">{format(new Date(meeting.followUpDate), 'PPP')}</p>
                      </div>
                    )}
                    
                    {meeting.followUpTime && (
                      <div>
                        <p className="text-sm text-muted-foreground">Follow Up Time</p>
                        <p className="font-medium">{meeting.followUpTime}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {meeting.notes && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notes</p>
                <p className="text-sm">{meeting.notes}</p>
              </div>
            )}
            
            {meeting.followUpNotes && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-2">Follow Up Notes</p>
                <p className="text-sm">{meeting.followUpNotes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {contact && (
          <ContactEmailDialog
            contact={contact}
            open={showEmailDialog}
            onOpenChange={setShowEmailDialog}
          />
        )}
      </div>
    </>
  );
};

export default MeetingDetails;
