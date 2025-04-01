
import React, { useState } from 'react';
import { useMeetings } from '@/context/meetings';
import { useContacts } from '@/context/ContactsContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MessagesSquare } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';
import { useIsMobile } from '@/hooks/use-mobile';
import { MeetingsFilter } from '@/components/meetings/MeetingsFilter';
import { MeetingsList } from '@/components/meetings/MeetingsList';
import { MeetingsGrid } from '@/components/meetings/MeetingsGrid';

const Meetings = () => {
  const { meetings, deleteMeeting } = useMeetings();
  const { getContactById } = useContacts();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "grid" : "list");

  // Update view mode when screen size changes
  React.useEffect(() => {
    setViewMode(isMobile ? "grid" : "list");
  }, [isMobile]);

  const filteredMeetings = meetings
    .filter(meeting => {
      if (selectedMeetingType === 'all') return true;
      return meeting.type === selectedMeetingType;
    })
    .filter(meeting => {
      if (!searchQuery) return true;
      
      // Also search in contact name/company
      const contact = getContactById(meeting.contactId);
      const contactName = contact?.fullName || '';
      const companyName = contact?.company || '';
      
      return meeting.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
             contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
             companyName.toLowerCase().includes(searchQuery.toLowerCase());
    });

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

  const handleDeleteMeeting = async (meetingId: string) => {
    await deleteMeeting(meetingId);
  };

  const handleCreateOrder = (contactId: string) => {
    navigate(`/orders/new?contactId=${contactId}`);
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

        <MeetingsFilter
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedMeetingType={selectedMeetingType}
          onMeetingTypeChange={setSelectedMeetingType}
          selectedSort={selectedSort}
          onSortChange={setSelectedSort}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
        
        <Tabs value={viewMode} className="w-full">
          <TabsContent value="list" className="mt-4">
            {sortedMeetings.length > 0 ? (
              <MeetingsList
                meetings={sortedMeetings}
                onViewMeeting={handleViewMeeting}
                onCreateOrder={handleCreateOrder}
                onDeleteMeeting={handleDeleteMeeting}
              />
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
              <MeetingsGrid
                meetings={sortedMeetings}
                onViewDetails={handleViewMeeting}
                onCreateOrder={handleCreateOrder}
              />
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
