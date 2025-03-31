
import React, { useState } from 'react';
import { useMeetings } from '@/context/meetings';
import { useContacts } from '@/context/ContactsContext';
import { useNavigate } from 'react-router-dom';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { MeetingTypeFilter } from '@/components/meetings/MeetingTypeFilter';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MessagesSquare, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
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

const Meetings = () => {
  const { meetings, deleteMeeting } = useMeetings();
  const { getContactById } = useContacts();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);

  // Filter meetings based on search and meeting type
  const filteredMeetings = meetings
    .filter(meeting => {
      if (selectedMeetingType === 'all') return true;
      return meeting.type === selectedMeetingType;
    })
    .filter(meeting => {
      if (!searchQuery) return true;
      return meeting.notes?.toLowerCase().includes(searchQuery.toLowerCase());
    });

  // Sort meetings based on selected sort option
  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (selectedSort === 'newest') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
  
  const handleCreateMeeting = () => {
    navigate('/meetings/new');
  };
  
  const handleViewMeeting = (meetingId: string) => {
    navigate(`/meetings/${meetingId}`);
  };

  const handleDeleteConfirm = async () => {
    if (meetingToDelete) {
      await deleteMeeting(meetingToDelete);
      setMeetingToDelete(null);
    }
  };

  // Helper function to get contact display name
  const getContactName = (contactId: string) => {
    const contact = getContactById(contactId);
    if (!contact) return "Unknown Contact";
    return contact.company || contact.fullName || "Unknown Contact";
  };

  return (
    <>
      <Helmet>
        <title>Meetings | CRM</title>
      </Helmet>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
            <p className="text-muted-foreground">Manage your meetings and follow-ups</p>
          </div>
          <Button onClick={handleCreateMeeting}>
            <Plus className="mr-2 h-4 w-4" /> Add Meeting
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search meetings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="w-full md:w-40">
              <MeetingTypeFilter
                value={selectedMeetingType}
                onValueChange={setSelectedMeetingType}
              />
            </div>
            <div className="w-full md:w-40">
              <Select value={selectedSort} onValueChange={setSelectedSort}>
                <SelectTrigger>
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="grid" className="w-full">
          <TabsList className="grid w-full md:w-60 grid-cols-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            {sortedMeetings.length > 0 ? (
              <div className="space-y-4">
                {sortedMeetings.map((meeting) => (
                  <div 
                    key={meeting.id} 
                    className="border rounded-lg p-3 hover:border-primary transition-colors cursor-pointer"
                    onClick={() => handleViewMeeting(meeting.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{getContactName(meeting.contactId)}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(meeting.date), 'PPP')} at {meeting.time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.stopPropagation();
                          handleViewMeeting(meeting.id);
                        }}>
                          View
                        </Button>
                        <AlertDialog open={meetingToDelete === meeting.id} onOpenChange={(open) => {
                          if (!open) setMeetingToDelete(null);
                        }}>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                setMeetingToDelete(meeting.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
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
                                onClick={handleDeleteConfirm}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Calendar size={40} />}
                title="No meetings found"
                description="Try changing your filters or create a new meeting"
                actionText="Create Meeting"
                actionLink="/meetings/new"
              />
            )}
          </TabsContent>
          
          <TabsContent value="grid" className="mt-4">
            {sortedMeetings.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {sortedMeetings.map((meeting) => (
                  <MeetingCard 
                    key={meeting.id} 
                    meeting={meeting} 
                    onViewDetails={() => handleViewMeeting(meeting.id)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<MessagesSquare size={40} />}
                title="No meetings found"
                description="Try changing your filters or create a new meeting"
                actionText="Create Meeting"
                actionLink="/meetings/new"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Meetings;
