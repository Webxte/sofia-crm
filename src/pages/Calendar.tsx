
import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, isSameMonth, isToday, parseISO } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetings } from "@/context/meetings";
import { useTasks } from "@/context/TasksContext";
import { Meeting, Task } from "@/types";

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meetings: Meeting[];
  tasks: Task[];
};

const Calendar = () => {
  const navigate = useNavigate();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Navigate to previous month
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Get days in a month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get day of week (0 = Sunday, 6 = Saturday)
  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  // Generate calendar days
  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Get days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    const calendarDays: CalendarDay[] = [];
    
    // Add days from previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
      const date = new Date(prevMonthYear, prevMonth, daysInPrevMonth - firstDayOfMonth + i + 1);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        meetings: [],
        tasks: [],
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      
      // Filter meetings for this day
      const dayMeetings = meetings.filter(meeting => 
        isSameDay(new Date(meeting.date), date)
      );
      
      // Filter follow-up meetings for this day
      const dayFollowUps = meetings.filter(meeting => 
        meeting.followUpScheduled && 
        meeting.followUpDate && 
        isSameDay(new Date(meeting.followUpDate), date)
      );
      
      // Combine regular meetings and follow-ups
      const allMeetings = [...dayMeetings, ...dayFollowUps];
      
      // Filter tasks for this day
      const dayTasks = tasks.filter(task => 
        task.dueDate && isSameDay(new Date(task.dueDate), date)
      );
      
      calendarDays.push({
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        meetings: allMeetings,
        tasks: dayTasks,
      });
    }
    
    // Add days from next month
    const totalDaysAdded = calendarDays.length;
    const daysToAdd = 42 - totalDaysAdded; // 6 rows of 7 days
    
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(nextMonthYear, nextMonth, i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        isToday: isToday(date),
        meetings: [],
        tasks: [],
      });
    }
    
    return calendarDays;
  }, [currentDate, meetings, tasks]);

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
  };

  // Handle meeting click - navigate to meeting details
  const handleMeetingClick = (e: React.MouseEvent, meetingId: string) => {
    e.stopPropagation();
    navigate(`/meetings/${meetingId}`);
  };

  // Handle task click - navigate to task details
  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    navigate(`/tasks/${taskId}`);
  };

  // Render calendar
  const calendarDays = generateCalendarDays();
  
  return (
    <>
      <Helmet>
        <title>Calendar | CRM</title>
      </Helmet>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={previousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="whitespace-nowrap"
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>{format(currentDate, 'MMMM yyyy')}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-2">
            {/* Calendar header - days of week */}
            <div className="grid grid-cols-7 mb-2 text-sm font-medium text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="px-2 py-4 text-center">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "min-h-[100px] p-1 border rounded-md",
                    day.isCurrentMonth ? "bg-card" : "bg-muted/30",
                    day.isToday && "border-primary",
                    selectedDate && isSameDay(day.date, selectedDate) && "ring-2 ring-primary",
                    "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className="flex flex-col h-full">
                    <div className={cn(
                      "text-right p-1 text-sm font-medium",
                      !day.isCurrentMonth && "text-muted-foreground"
                    )}>
                      {format(day.date, 'd')}
                    </div>
                    <div className="flex-1 overflow-auto space-y-1">
                      {day.meetings.map((meeting) => (
                        <div
                          key={meeting.id + (meeting.followUpDate ? 'followup' : '')}
                          className={cn(
                            "text-xs px-1 py-0.5 rounded truncate",
                            meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                              : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
                            "cursor-pointer hover:opacity-80"
                          )}
                          onClick={(e) => handleMeetingClick(e, meeting.id)}
                          title={meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                            ? `Follow-up: ${meeting.type} ${meeting.time || ''}`
                            : `${meeting.type} ${meeting.time || ''}`}
                        >
                          {meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                            ? `📅 Follow-up ${meeting.followUpTime || ''}`
                            : `🤝 ${meeting.type} ${meeting.time || ''}`}
                        </div>
                      ))}
                      {day.tasks.map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs px-1 py-0.5 rounded truncate",
                            task.priority === 'high' 
                              ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100" 
                              : task.priority === 'medium'
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100"
                                : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100",
                            "cursor-pointer hover:opacity-80"
                          )}
                          onClick={(e) => handleTaskClick(e, task.id)}
                          title={`${task.title} (${task.priority})`}
                        >
                          ✓ {task.title}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Calendar;
