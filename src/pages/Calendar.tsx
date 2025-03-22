
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isSameDay, isSameMonth, subMonths, addMonths, startOfWeek, startOfMonth, endOfWeek, endOfMonth, eachDayOfInterval } from "date-fns";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeetings } from "@/context/MeetingsContext";
import { useTasks } from "@/context/TasksContext";
import { Meeting, Task } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

type EventType = 'meeting' | 'followUp' | 'task';

interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  date: Date;
  time?: string;
  contactName?: string;
  original: Meeting | Task;
}

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState("month");
  const [displayedEvents, setDisplayedEvents] = useState<CalendarEvent[]>([]);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [eventFilter, setEventFilter] = useState<EventType | 'all'>('all');
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const { getContactById } = useContacts();
  const navigate = useNavigate();

  // Combine meetings, follow-ups, and tasks into events
  useEffect(() => {
    const events: CalendarEvent[] = [];
    
    // Add meetings
    meetings.forEach(meeting => {
      const contact = getContactById(meeting.contactId);
      events.push({
        id: meeting.id,
        type: 'meeting',
        title: `${meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)} with ${contact?.fullName || contact?.company || "Unknown"}`,
        date: new Date(meeting.date),
        time: meeting.time,
        contactName: contact?.fullName || contact?.company,
        original: meeting
      });
      
      // Add follow-ups if scheduled
      if (meeting.followUpScheduled && meeting.followUpDate) {
        events.push({
          id: `followup-${meeting.id}`,
          type: 'followUp',
          title: `Follow-up: ${contact?.fullName || contact?.company || "Unknown"}`,
          date: new Date(meeting.followUpDate),
          contactName: contact?.fullName || contact?.company,
          original: meeting
        });
      }
    });
    
    // Add tasks
    tasks.forEach(task => {
      if (task.dueDate) {
        const contact = task.contactId ? getContactById(task.contactId) : undefined;
        events.push({
          id: task.id,
          type: 'task',
          title: task.title,
          date: new Date(task.dueDate),
          time: task.dueTime,
          contactName: contact?.fullName || contact?.company,
          original: task
        });
      }
    });
    
    // Filter events by date and event type
    filterEventsByDate(events);
  }, [meetings, tasks, date, view, eventFilter, getContactById]);

  // Calculate calendar days based on view
  useEffect(() => {
    let days: Date[] = [];
    
    if (view === 'month') {
      const start = startOfMonth(date);
      const end = endOfMonth(date);
      days = eachDayOfInterval({ start, end });
    } else if (view === 'week') {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      days = eachDayOfInterval({ start, end });
    } else if (view === 'day') {
      days = [date];
    }
    
    setCalendarDays(days);
  }, [date, view]);

  // Filter events by selected date and view
  const filterEventsByDate = (allEvents: CalendarEvent[]) => {
    let filteredEvents: CalendarEvent[] = [];
    
    if (view === 'month') {
      // For month view, show events for the selected day
      filteredEvents = allEvents.filter(event => 
        isSameDay(new Date(event.date), date)
      );
    } else if (view === 'week') {
      // For week view, show events within the week
      const startDate = startOfWeek(date, { weekStartsOn: 0 });
      const endDate = endOfWeek(date, { weekStartsOn: 0 });
      filteredEvents = allEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= startDate && eventDate <= endDate;
      });
    } else if (view === 'day') {
      // For day view, show events for the selected day
      filteredEvents = allEvents.filter(event => 
        isSameDay(new Date(event.date), date)
      );
    }
    
    // Apply event type filter if not 'all'
    if (eventFilter !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === eventFilter);
    }
    
    setDisplayedEvents(filteredEvents);
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };

  // Navigate to previous period
  const handlePrevPeriod = () => {
    if (view === 'month') {
      setDate(prevDate => subMonths(prevDate, 1));
    } else if (view === 'week') {
      setDate(prevDate => addDays(prevDate, -7));
    } else if (view === 'day') {
      setDate(prevDate => addDays(prevDate, -1));
    }
  };

  // Navigate to next period
  const handleNextPeriod = () => {
    if (view === 'month') {
      setDate(prevDate => addMonths(prevDate, 1));
    } else if (view === 'week') {
      setDate(prevDate => addDays(prevDate, 7));
    } else if (view === 'day') {
      setDate(prevDate => addDays(prevDate, 1));
    }
  };

  // Navigate to today
  const handleToday = () => {
    setDate(new Date());
  };

  // Get event type color
  const getEventTypeColor = (type: EventType) => {
    switch (type) {
      case 'meeting':
        return "bg-blue-100 text-blue-800";
      case 'followUp':
        return "bg-purple-100 text-purple-800";
      case 'task':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Create day content for calendar
  const getDayContent = (day: Date) => {
    const dayEvents = [
      ...meetings.filter(meeting => isSameDay(new Date(meeting.date), day)),
      ...meetings.filter(meeting => meeting.followUpScheduled && meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day)),
      ...tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day))
    ];
    
    if (dayEvents.length === 0) return null;
    
    return (
      <div className="w-full flex justify-center">
        <div className="h-1.5 w-1.5 bg-primary rounded-full" />
      </div>
    );
  };

  // Navigate to appropriate form based on event type
  const handleAddEvent = (type: EventType) => {
    switch (type) {
      case 'meeting':
        navigate("/meetings/new");
        break;
      case 'task':
        navigate("/tasks/new");
        break;
      default:
        navigate("/meetings/new");
    }
  };

  // Navigate to event details
  const handleEventClick = (event: CalendarEvent) => {
    if (event.type === 'meeting' || event.type === 'followUp') {
      navigate(`/meetings/edit/${event.id.replace('followup-', '')}`);
    } else if (event.type === 'task') {
      navigate(`/tasks/edit/${event.id}`);
    }
  };

  return (
    <div className="space-y-6 bg-background">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your schedule
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            className="sm:w-auto" 
            onClick={() => handleAddEvent('meeting')}
          >
            <Plus className="mr-2 h-4 w-4" /> Meeting
          </Button>
          <Button 
            className="sm:w-auto" 
            variant="outline" 
            onClick={() => handleAddEvent('task')}
          >
            <Plus className="mr-2 h-4 w-4" /> Task
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center">
          <Button variant="outline" className="rounded-r-none border-r-0" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="rounded-none border-r-0" onClick={handlePrevPeriod}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-l-none" onClick={handleNextPeriod}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {date && view === 'month' && format(date, "MMMM yyyy")}
            {date && view === 'week' && `Week of ${format(startOfWeek(date, { weekStartsOn: 0 }), "MMM d")}`}
            {date && view === 'day' && format(date, "MMMM d, yyyy")}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:ml-auto">
          <Select value={view} onValueChange={setView}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="day">Day</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={eventFilter} onValueChange={(value) => setEventFilter(value as EventType | 'all')}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="meeting">Meetings</SelectItem>
              <SelectItem value="followUp">Follow-ups</SelectItem>
              <SelectItem value="task">Tasks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-lg border border-border overflow-hidden bg-card p-4">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            className="mx-auto pointer-events-auto bg-card"
            showOutsideDays={true}
            components={{
              DayContent: ({ date: day, ...props }) => (
                <div className="relative flex flex-col items-center justify-center h-full w-full">
                  <div {...props}>{format(day, "d")}</div>
                  {getDayContent(day)}
                </div>
              ),
            }}
            modifiers={{
              hasEvent: [
                ...meetings.map(meeting => new Date(meeting.date)),
                ...meetings.filter(m => m.followUpScheduled && m.followUpDate).map(m => new Date(m.followUpDate as Date)),
                ...tasks.filter(t => t.dueDate).map(t => new Date(t.dueDate as Date))
              ],
            }}
            modifiersStyles={{
              hasEvent: { 
                fontWeight: 'bold',
              },
            }}
          />
        </div>

        <div className="space-y-4 bg-card p-4 rounded-lg border border-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {view === 'day' && format(date, "MMMM d, yyyy")}
              {view === 'week' && 'This Week'}
              {view === 'month' && format(date, "MMMM d, yyyy")}
            </h2>
            <Badge>
              {displayedEvents.length} {displayedEvents.length === 1 ? "Event" : "Events"}
            </Badge>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="meetings">Meetings</TabsTrigger>
              <TabsTrigger value="followUps">Follow-ups</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              {renderEventsList(displayedEvents, 'all')}
            </TabsContent>
            
            <TabsContent value="meetings">
              {renderEventsList(displayedEvents.filter(e => e.type === 'meeting'), 'meeting')}
            </TabsContent>
            
            <TabsContent value="followUps">
              {renderEventsList(displayedEvents.filter(e => e.type === 'followUp'), 'followUp')}
            </TabsContent>
            
            <TabsContent value="tasks">
              {renderEventsList(displayedEvents.filter(e => e.type === 'task'), 'task')}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
  
  function renderEventsList(events: CalendarEvent[], type: EventType | 'all') {
    if (events.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            <p>No {type !== 'all' ? type + ' ' : ''}events scheduled</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => handleAddEvent(type === 'all' ? 'meeting' : type)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add {type === 'all' || type === 'meeting' ? 'Meeting' : 
                                               type === 'task' ? 'Task' : 'Follow-up'}
            </Button>
          </CardContent>
        </Card>
      );
    }
    
    return (
      <div className="space-y-3">
        {events.map((event) => (
          <Card 
            key={event.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleEventClick(event)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-start">
                <Badge
                  className={getEventTypeColor(event.type)}
                  variant="outline"
                >
                  {event.type === 'meeting' ? 'Meeting' : 
                   event.type === 'followUp' ? 'Follow-up' : 'Task'}
                </Badge>
                {event.time && (
                  <CardDescription className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {event.time}
                  </CardDescription>
                )}
              </div>
              <CardTitle className="text-base">
                {event.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {event.contactName && (
                <p className="text-sm text-muted-foreground mb-1">
                  Contact: {event.contactName}
                </p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {event.type === 'meeting' 
                  ? (event.original as Meeting).notes
                  : event.type === 'followUp'
                    ? (event.original as Meeting).followUpNotes || 'Follow-up scheduled'
                    : (event.original as Task).description || 'No description'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default Calendar;
