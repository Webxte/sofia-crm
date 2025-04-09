
import React, { useState, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { format, isSameDay, isSameMonth, isToday, parseISO, addDays, startOfWeek, endOfWeek, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Grid, Grid3X3, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMeetings } from "@/context/meetings";
import { useTasks } from "@/context/TasksContext";
import { Meeting, Task } from "@/types";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  meetings: Meeting[];
  tasks: Task[];
};

type CalendarView = 'month' | 'week' | 'day';

const Calendar = () => {
  const navigate = useNavigate();
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [view, setView] = useState<CalendarView>('month');

  const previous = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, -7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const next = () => {
    if (view === 'month') {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    } else if (view === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else if (view === 'day') {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    if (view === 'month') {
      const daysInMonth = getDaysInMonth(year, month);
      const firstDayOfMonth = getFirstDayOfMonth(year, month);
      
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevMonthYear = month === 0 ? year - 1 : year;
      const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
      
      const calendarDays: CalendarDay[] = [];
      
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
      
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        
        const dayMeetings = meetings.filter(meeting => 
          isSameDay(new Date(meeting.date), date)
        );
        
        const dayFollowUps = meetings.filter(meeting => 
          meeting.followUpScheduled && 
          meeting.followUpDate && 
          isSameDay(new Date(meeting.followUpDate), date)
        );
        
        const allMeetings = [...dayMeetings, ...dayFollowUps];
        
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
      
      const totalDaysAdded = calendarDays.length;
      const daysToAdd = 42 - totalDaysAdded;
      
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
    }
    
    if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
      
      return days.map(date => {
        const dayMeetings = meetings.filter(meeting => 
          isSameDay(new Date(meeting.date), date)
        );
        
        const dayFollowUps = meetings.filter(meeting => 
          meeting.followUpScheduled && 
          meeting.followUpDate && 
          isSameDay(new Date(meeting.followUpDate), date)
        );
        
        const allMeetings = [...dayMeetings, ...dayFollowUps];
        
        const dayTasks = tasks.filter(task => 
          task.dueDate && isSameDay(new Date(task.dueDate), date)
        );
        
        return {
          date,
          isCurrentMonth: isSameMonth(date, currentDate),
          isToday: isToday(date),
          meetings: allMeetings,
          tasks: dayTasks,
        };
      });
    }
    
    if (view === 'day') {
      const date = currentDate;
      
      const dayMeetings = meetings.filter(meeting => 
        isSameDay(new Date(meeting.date), date)
      );
      
      const dayFollowUps = meetings.filter(meeting => 
        meeting.followUpScheduled && 
        meeting.followUpDate && 
        isSameDay(new Date(meeting.followUpDate), date)
      );
      
      const allMeetings = [...dayMeetings, ...dayFollowUps];
      
      allMeetings.sort((a, b) => {
        const aTime = a.time || "";
        const bTime = b.time || "";
        return aTime.localeCompare(bTime);
      });
      
      const dayTasks = tasks.filter(task => 
        task.dueDate && isSameDay(new Date(task.dueDate), date)
      );
      
      dayTasks.sort((a, b) => {
        const priorities = { high: 0, medium: 1, low: 2 };
        return priorities[(a.priority || 'low') as 'high' | 'medium' | 'low'] - 
               priorities[(b.priority || 'low') as 'high' | 'medium' | 'low'];
      });
      
      return [{
        date,
        isCurrentMonth: true,
        isToday: isToday(date),
        meetings: allMeetings,
        tasks: dayTasks,
      }];
    }
    
    return [];
  }, [currentDate, meetings, tasks, view]);

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    if (view === 'month') {
      setCurrentDate(day.date);
    }
  };

  const handleMeetingClick = (e: React.MouseEvent, meetingId: string) => {
    e.stopPropagation();
    navigate(`/meetings/${meetingId}`);
  };

  const handleTaskClick = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    navigate(`/tasks/${taskId}`);
  };

  const getViewTitle = () => {
    if (view === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  // Generate calendar days
  const calendarDays = generateCalendarDays();

  const renderCalendarView = () => {
    if (view === 'month') {
      return (
        <>
          <div className="grid grid-cols-7 mb-2 text-sm font-medium text-muted-foreground">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="px-2 py-4 text-center">
                {day}
              </div>
            ))}
          </div>
          
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
        </>
      );
    } else if (view === 'week') {
      return (
        <>
          <div className="grid grid-cols-7 mb-2 text-sm font-medium">
            {calendarDays.map((day, index) => (
              <div key={index} className="px-2 py-2 text-center">
                <div className={cn(
                  "font-medium",
                  day.isToday && "text-primary"
                )}>
                  {format(day.date, 'E')}
                </div>
                <div className={cn(
                  "text-xl rounded-full w-8 h-8 flex items-center justify-center mx-auto",
                  day.isToday && "bg-primary text-primary-foreground",
                  selectedDate && isSameDay(day.date, selectedDate) && "ring-2 ring-primary"
                )}>
                  {format(day.date, 'd')}
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1 mt-2">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={cn(
                  "min-h-[300px] p-2 border rounded-md",
                  day.isToday && "border-primary",
                  selectedDate && isSameDay(day.date, selectedDate) && "ring-2 ring-primary",
                  "cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                )}
                onClick={() => handleDayClick(day)}
              >
                <div className="space-y-2 max-h-[500px] overflow-auto">
                  {day.meetings.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium mb-1">Meetings:</h3>
                      <div className="space-y-1">
                        {day.meetings.map((meeting) => (
                          <div
                            key={meeting.id + (meeting.followUpDate ? 'followup' : '')}
                            className={cn(
                              "text-xs p-1.5 rounded",
                              meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100",
                              "cursor-pointer hover:opacity-80"
                            )}
                            onClick={(e) => handleMeetingClick(e, meeting.id)}
                          >
                            <div className="font-medium">
                              {meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                                ? `Follow-up (${meeting.followUpTime || 'No time'})` 
                                : `${meeting.type} (${meeting.time || 'No time'})`}
                            </div>
                            <div className="truncate">{meeting.contactName || 'No contact'}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {day.tasks.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium mb-1">Tasks:</h3>
                      <div className="space-y-1">
                        {day.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={cn(
                              "text-xs p-1.5 rounded",
                              task.priority === 'high' 
                                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-100" 
                                : task.priority === 'medium'
                                  ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-100"
                                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-100",
                              "cursor-pointer hover:opacity-80"
                            )}
                            onClick={(e) => handleTaskClick(e, task.id)}
                          >
                            <div className="font-medium">{task.title}</div>
                            <div className="truncate">
                              {task.priority && `Priority: ${task.priority}`}
                              {task.contactName && ` • ${task.contactName}`}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {day.meetings.length === 0 && day.tasks.length === 0 && (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      No events
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      );
    } else {
      const day = calendarDays[0];
      return (
        <div className="border rounded-md p-4">
          <h2 className="text-lg font-medium mb-4">
            {format(day.date, 'EEEE, MMMM d, yyyy')}
            {day.isToday && <span className="ml-2 text-sm bg-primary text-primary-foreground px-2 py-0.5 rounded-full">Today</span>}
          </h2>
          
          <div className="space-y-6">
            {day.meetings.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-2 border-b pb-1">Meetings</h3>
                <div className="space-y-2">
                  {day.meetings.map((meeting) => (
                    <div
                      key={meeting.id + (meeting.followUpDate ? 'followup' : '')}
                      className={cn(
                        "p-3 rounded-md",
                        meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                          ? "bg-green-50 border-l-4 border-green-500 dark:bg-green-900/20"
                          : "bg-blue-50 border-l-4 border-blue-500 dark:bg-blue-900/20",
                        "cursor-pointer hover:opacity-90"
                      )}
                      onClick={(e) => handleMeetingClick(e, meeting.id)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">
                          {meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date) 
                            ? `Follow-up Meeting` 
                            : meeting.type}
                        </div>
                        <div className="text-sm font-medium">
                          {meeting.followUpDate && isSameDay(new Date(meeting.followUpDate), day.date)
                            ? meeting.followUpTime || 'No time'
                            : meeting.time || 'No time'}
                        </div>
                      </div>
                      <div className="text-sm mt-1">
                        {meeting.contactName || 'No contact'} 
                        {meeting.location && ` • ${meeting.location}`}
                      </div>
                      {meeting.notes && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {meeting.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {day.tasks.length > 0 && (
              <div>
                <h3 className="text-md font-medium mb-2 border-b pb-1">Tasks</h3>
                <div className="space-y-2">
                  {day.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={cn(
                        "p-3 rounded-md",
                        task.priority === 'high' 
                          ? "bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20" 
                          : task.priority === 'medium'
                            ? "bg-orange-50 border-l-4 border-orange-500 dark:bg-orange-900/20"
                            : "bg-slate-50 border-l-4 border-slate-500 dark:bg-slate-900/20",
                        "cursor-pointer hover:opacity-90"
                      )}
                      onClick={(e) => handleTaskClick(e, task.id)}
                    >
                      <div className="flex justify-between">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs px-2 py-0.5 rounded-full bg-muted">
                          {task.priority || 'low'}
                        </div>
                      </div>
                      {task.description && (
                        <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {task.description}
                        </div>
                      )}
                      {task.contactName && (
                        <div className="text-xs mt-1">
                          Contact: {task.contactName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {day.meetings.length === 0 && day.tasks.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                No events scheduled for today
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Calendar | CRM</title>
      </Helmet>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={previous}
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
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
          <ToggleGroup type="single" value={view} onValueChange={(value) => value && setView(value as CalendarView)} className="mt-2 sm:mt-0">
            <ToggleGroupItem value="month" aria-label="Month view">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Month
            </ToggleGroupItem>
            <ToggleGroupItem value="week" aria-label="Week view">
              <Grid className="h-4 w-4 mr-2" />
              Week
            </ToggleGroupItem>
            <ToggleGroupItem value="day" aria-label="Day view">
              <List className="h-4 w-4 mr-2" />
              Day
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <Card>
          <CardHeader className="px-6 py-4">
            <CardTitle>{getViewTitle()}</CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-2">
            {renderCalendarView()}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Calendar;
