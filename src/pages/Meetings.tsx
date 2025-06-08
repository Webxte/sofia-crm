
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
import { MeetingEmailDialog } from '@/components/meetings/email/MeetingEmailDialog';

const Meetings = () => {
  const { meetings, deleteMeeting } = useMeetings();
  const { getContactById } = useContacts();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeetingType, setSelectedMeetingType] = useState('all');
  const [selectedSort, setSelectedSort] = useState('newest');
  const [viewMode, setViewMode] = useState<"grid" | "list">(isMobile ? "grid" : "list");
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  
  // State for email dialog
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);

  // Update view mode when screen size changes
  React.useEffect(() => {
    setViewMode(isMobile ? "grid" : "list");
  }, [isMobile]);

  // Debug logging for admin functionality
  console.log("Meetings page - Admin status:", { isAdmin, userId: user?.id, showAllMeetings });

  const filteredMeetings = meetings
    .filter(meeting => {
      // Filter by user (if not showing all meetings)
      if (!showAllMeetings) {
        if (meeting.agentId !== user?.id) return false;
      }
      
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

  console.log("Filtered meetings count:", filteredMeetings.length, "Total meetings:", meetings.length);

  const sortedMeetings = [...filteredMeetings].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    
    if (selectedSort === 'newest') {
      return dateB - dateA; // Sort by newest first
    } else {
      return dateA - dateB; // Sort by oldest first
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
  
  const handleSendEmail = (meeting: any) => {
    setSelectedMeeting(meeting);
    setShowEmailDialog(true);
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
          showAllMeetings={showAllMeetings}
          onShowAllMeetingsChange={setShowAllMeetings}
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
                onSendEmail={handleSendEmail}
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
        
        {selectedMeeting && (
          <MeetingEmailDialog
            meeting={selectedMeeting}
            open={showEmailDialog}
            onOpenChange={setShowEmailDialog}
          />
        )}
      </div>
    </>
  );
};

export default Meetings;
