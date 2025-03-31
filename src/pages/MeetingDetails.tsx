
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMeetings } from '@/context/MeetingsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';

const MeetingDetails = () => {
  const { id } = useParams();
  const { getMeetingById } = useMeetings();
  
  const meeting = id ? getMeetingById(id) : undefined;
  
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
  
  // Create a friendly description for the meeting title since it doesn't exist as a property
  const meetingTitle = `Meeting with contact${meeting.contactId ? '' : ' (No contact specified)'}`;
  
  return (
    <>
      <Helmet>
        <title>{meetingTitle || 'Meeting'} | CRM</title>
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
            <Badge variant={meeting.type === 'meeting' ? 'default' : 'outline'}>
              {meeting.type === 'meeting' ? 'In Person' : meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
            </Badge>
          </div>
          <div className="flex space-x-2">
            <Button asChild variant="outline">
              <Link to={`/meetings/${meeting.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
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
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default MeetingDetails;
