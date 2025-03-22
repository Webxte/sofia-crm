
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, addDays, isSameDay, isSameMonth, subMonths, addMonths } from "date-fns";
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight } from "lucide-react";
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
import { Meeting } from "@/types";
import { useContacts } from "@/context/ContactsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Calendar = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [view, setView] = useState("month");
  const [displayedMeetings, setDisplayedMeetings] = useState<Meeting[]>([]);
  const { meetings } = useMeetings();
  const { getContactById } = useContacts();
  const navigate = useNavigate();

  // Initialize with meetings for today
  useEffect(() => {
    filterMeetingsByDate(date);
  }, [meetings, date]);

  // Filter meetings by selected date
  const filterMeetingsByDate = (selectedDate: Date) => {
    const filtered = meetings.filter(meeting => 
      isSameDay(new Date(meeting.date), selectedDate)
    );
    setDisplayedMeetings(filtered);
  };

  // Handle date change
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      filterMeetingsByDate(newDate);
    }
  };

  // Navigate to previous month
  const handlePrevMonth = () => {
    setDate(prevDate => subMonths(prevDate, 1));
  };

  // Navigate to next month
  const handleNextMonth = () => {
    setDate(prevDate => addMonths(prevDate, 1));
  };

  // Navigate to today
  const handleToday = () => {
    const today = new Date();
    setDate(today);
    filterMeetingsByDate(today);
  };

  // Get meeting type color
  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800";
      case "phone":
        return "bg-green-100 text-green-800";
      case "email":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Create day content for calendar
  const getDayContent = (day: Date) => {
    const dayMeetings = meetings.filter(meeting => 
      isSameDay(new Date(meeting.date), day)
    );
    
    if (dayMeetings.length === 0) return null;
    
    return (
      <div className="w-full flex justify-center">
        <div className="h-1.5 w-1.5 bg-primary rounded-full" />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your schedule
          </p>
        </div>
        <Button className="sm:w-auto w-full" onClick={() => navigate("/meetings/new")}>
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center">
          <Button variant="outline" className="rounded-r-none border-r-0" onClick={handleToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" className="rounded-none border-r-0" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="rounded-l-none" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {date ? format(date, "MMMM yyyy") : "Select a date"}
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-lg border border-border overflow-hidden bg-card">
          <div className="p-4">
            <CalendarComponent
              mode="single"
              selected={date}
              onSelect={handleDateChange}
              className="mx-auto pointer-events-auto"
              components={{
                DayContent: ({ date: day }) => getDayContent(day),
              }}
              modifiers={{
                hasMeeting: meetings.map(meeting => new Date(meeting.date)),
              }}
              modifiersStyles={{
                hasMeeting: { 
                  fontWeight: 'bold',
                },
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">
              {format(date, "MMMM d, yyyy")}
            </h2>
            <Badge>
              {displayedMeetings.length} {displayedMeetings.length === 1 ? "Event" : "Events"}
            </Badge>
          </div>

          {displayedMeetings.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>No events scheduled for this day</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => navigate("/meetings/new")}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedMeetings.map((meeting) => {
                const contact = getContactById(meeting.contactId);
                return (
                  <Card key={meeting.id} className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <Badge
                          className={getMeetingTypeColor(meeting.type)}
                          variant="outline"
                        >
                          {meeting.type.charAt(0).toUpperCase() + meeting.type.slice(1)}
                        </Badge>
                        <CardDescription>{meeting.time}</CardDescription>
                      </div>
                      <CardTitle className="text-base">
                        {contact?.fullName || contact?.company || "Unknown Contact"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {meeting.notes}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
