
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMeetings } from '@/context/meetings';
import { useContacts } from '@/context/contacts/ContactsContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { meetings } = useMeetings();
  const { getContactById } = useContacts();
  const navigate = useNavigate();

  console.log("Calendar: Total meetings:", meetings.length);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  // Group meetings by date
  const meetingsByDate = useMemo(() => {
    const grouped: Record<string, typeof meetings> = {};
    
    meetings.forEach(meeting => {
      const dateKey = format(new Date(meeting.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(meeting);
    });
    
    console.log("Calendar: Meetings grouped by date:", grouped);
    return grouped;
  }, [meetings]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleAddMeeting = () => {
    navigate('/meetings/new');
  };

  const handleMeetingClick = (meetingId: string) => {
    navigate(`/meetings/${meetingId}`);
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'phone':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'email':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'online':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <>
      <Helmet>
        <title>Calendar | CRM</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">View your meetings and schedule</p>
          </div>
          <Button onClick={handleAddMeeting}>
            <Plus className="mr-2 h-4 w-4" /> Add Meeting
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentDate, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayMeetings = meetingsByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[100px] p-2 border border-border rounded-md",
                      !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                      isToday && "bg-primary/10 border-primary"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1",
                      isToday && "text-primary font-bold"
                    )}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {dayMeetings.slice(0, 3).map(meeting => {
                        const contact = getContactById(meeting.contactId);
                        const displayName = contact?.company || contact?.fullName || 'Unknown Contact';
                        
                        return (
                          <Badge
                            key={meeting.id}
                            variant="outline"
                            className={cn(
                              "text-xs p-1 cursor-pointer truncate block",
                              getMeetingTypeColor(meeting.type)
                            )}
                            onClick={() => handleMeetingClick(meeting.id)}
                          >
                            <div className="truncate">
                              {displayName} - {meeting.time}
                            </div>
                          </Badge>
                        );
                      })}
                      
                      {dayMeetings.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{dayMeetings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Calendar;
