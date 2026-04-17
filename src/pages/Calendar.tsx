
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, ArrowLeft, Clock, MapPin, User, CalendarDays, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMeetings } from '@/context/meetings';
import { useTasks } from '@/context/tasks';
import { useContacts } from '@/context/contacts/ContactsContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Helmet } from 'react-helmet-async';
import { Meeting, Task } from '@/types';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const { meetings } = useMeetings();
  const { tasks } = useTasks();
  const { getContactById } = useContacts();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd
  });

  const meetingsByDate = useMemo(() => {
    const grouped: Record<string, Meeting[]> = {};
    meetings.forEach(meeting => {
      const dateKey = format(new Date(meeting.date), 'yyyy-MM-dd');
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(meeting);
    });
    return grouped;
  }, [meetings]);

  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      const dateKey = task.dueDate.slice(0, 10);
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(task);
    });
    return grouped;
  }, [tasks]);

  const selectedDayMeetings = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    return (meetingsByDate[dateKey] || []).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDay, meetingsByDate]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = format(selectedDay, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  }, [selectedDay, tasksByDate]);

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'phone': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'email': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'online': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getMeetingTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Day Detail View
  if (selectedDay) {
    return (
      <>
        <Helmet><title>Calendar - {format(selectedDay, 'MMMM d, yyyy')} | CRM</title></Helmet>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelectedDay(null)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">
                  {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                </h1>
                <p className="text-muted-foreground">
                  {[
                    selectedDayMeetings.length > 0 && `${selectedDayMeetings.length} meeting${selectedDayMeetings.length > 1 ? 's' : ''}`,
                    selectedDayTasks.length > 0 && `${selectedDayTasks.length} task${selectedDayTasks.length > 1 ? 's' : ''}`,
                  ].filter(Boolean).join(' · ') || 'Nothing scheduled'}
                </p>
              </div>
            </div>
            <Button onClick={() => navigate('/meetings/new')}>
              <Plus className="mr-2 h-4 w-4" /> Add Meeting
            </Button>
          </div>

          {selectedDayMeetings.length === 0 && selectedDayTasks.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium mb-1">Nothing scheduled this day</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Schedule a meeting or create a task with this due date.
                </p>
                <Button variant="outline" onClick={() => navigate('/meetings/new')}>
                  <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedDayTasks.length > 0 && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">Tasks due</h2>
                  {selectedDayTasks.map(task => (
                    <Card
                      key={task.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-amber-400"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckSquare className={cn("h-4 w-4 shrink-0", task.status === 'completed' ? 'text-green-500' : 'text-amber-500')} />
                            <span className={cn("font-medium truncate", task.status === 'completed' && 'line-through text-muted-foreground')}>
                              {task.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={cn("text-xs",
                              task.priority === 'high' ? 'border-red-300 text-red-700' :
                              task.priority === 'medium' ? 'border-amber-300 text-amber-700' :
                              'border-gray-300 text-gray-600'
                            )}>
                              {task.priority}
                            </Badge>
                            <Badge variant={task.status === 'completed' ? 'secondary' : 'outline'} className="text-xs">
                              {task.status}
                            </Badge>
                          </div>
                        </div>
                        {task.description && (
                          <p className="text-sm text-muted-foreground mt-1 ml-6 line-clamp-1">{task.description}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedDayMeetings.length > 0 && (
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1 pt-2">Meetings</h2>
              )}
              {selectedDayMeetings.map(meeting => {
                const contact = getContactById(meeting.contactId);
                const displayName = contact?.company || contact?.fullName || meeting.contactName || 'Unknown Contact';
                const contactFullName = contact?.fullName || meeting.contactName || '';

                return (
                  <Card
                    key={meeting.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4"
                    style={{
                      borderLeftColor: meeting.type === 'meeting' ? 'hsl(var(--primary))' 
                        : meeting.type === 'phone' ? '#22c55e' 
                        : meeting.type === 'email' ? '#a855f7' 
                        : meeting.type === 'online' ? '#f97316' 
                        : 'hsl(var(--muted-foreground))'
                    }}
                    onClick={() => navigate(`/meetings/${meeting.id}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-base truncate">{displayName}</h3>
                            <Badge variant="outline" className={cn("text-xs shrink-0", getMeetingTypeColor(meeting.type))}>
                              {getMeetingTypeLabel(meeting.type)}
                            </Badge>
                          </div>
                          
                          {contactFullName && contactFullName !== displayName && (
                            <p className="text-sm text-muted-foreground mb-2">{contactFullName}</p>
                          )}

                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" /> {meeting.time}
                            </span>
                            {meeting.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {meeting.location}
                              </span>
                            )}
                            {meeting.agentName && (
                              <span className="flex items-center gap-1">
                                <User className="h-3.5 w-3.5" /> {meeting.agentName}
                              </span>
                            )}
                          </div>

                          {meeting.notes && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{meeting.notes}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  // Month View
  return (
    <>
      <Helmet><title>Calendar | CRM</title></Helmet>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">View your meetings and schedule</p>
          </div>
          <Button onClick={() => navigate('/meetings/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Meeting
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{format(currentDate, 'MMMM yyyy')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setCurrentDate(new Date()); setSelectedDay(new Date()); }}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={handleNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
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
                const dayTasks = tasksByDate[dateKey] || [];
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const totalItems = dayMeetings.length + dayTasks.length;

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "min-h-[90px] p-2 border border-border rounded-md cursor-pointer transition-colors hover:bg-accent/50",
                      !isCurrentMonth && "bg-muted/30 text-muted-foreground",
                      isToday && "bg-primary/10 border-primary ring-1 ring-primary/30"
                    )}
                  >
                    <div className={cn(
                      "text-sm font-medium mb-1 flex items-center justify-between",
                      isToday && "text-primary font-bold"
                    )}>
                      <span>{format(day, 'd')}</span>
                      {totalItems > 0 && (
                        <span className="text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5 leading-none">
                          {totalItems}
                        </span>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      {dayTasks.slice(0, 1).map(task => (
                        <div
                          key={task.id}
                          className="text-[10px] leading-tight px-1 py-0.5 rounded truncate bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          title={task.title}
                        >
                          ✓ {task.title}
                        </div>
                      ))}

                      {dayMeetings.slice(0, dayTasks.length > 0 ? 1 : 2).map(meeting => {
                        const contact = getContactById(meeting.contactId);
                        const displayName = contact?.company || contact?.fullName || meeting.contactName || '?';

                        return (
                          <div
                            key={meeting.id}
                            className={cn(
                              "text-[10px] leading-tight px-1 py-0.5 rounded truncate",
                              getMeetingTypeColor(meeting.type)
                            )}
                            title={`${displayName} - ${meeting.time}`}
                          >
                            {meeting.time} {displayName}
                          </div>
                        );
                      })}

                      {totalItems > (dayTasks.length > 0 ? 2 : 2) && (
                        <div className="text-[10px] text-muted-foreground px-1">
                          +{totalItems - (dayTasks.length > 0 ? 2 : 2)} more
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
