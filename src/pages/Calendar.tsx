import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isBefore, isAfter } from 'date-fns';
import { DayPicker } from 'react-day-picker';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTasks } from "@/context/TasksContext";
import { useMeetings } from "@/context/meetings";
import { Task, Meeting } from "@/types";

const CalendarPage = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const { tasks } = useTasks();
  const { meetings } = useMeetings();
  
  // Function to get tasks for the selected date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      return isSameDay(new Date(task.dueDate), date);
    });
  };
  
  // Function to get meetings for the selected date
  const getMeetingsForDate = (date: Date): Meeting[] => {
    return meetings.filter(meeting => isSameDay(new Date(meeting.date), date));
  };
  
  // Get tasks and meetings for the selected date
  const tasksForSelectedDate = getTasksForDate(selectedDate || new Date());
  const meetingsForSelectedDate = getMeetingsForDate(selectedDate || new Date());
  
  // Generate an array of dates for the current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Function to check if a date has any tasks or meetings
  const hasEvents = (date: Date): boolean => {
    return tasks.some(task => task.dueDate && isSameDay(new Date(task.dueDate), date)) ||
           meetings.some(meeting => isSameDay(new Date(meeting.date), date));
  };
  
  // Function to render the day cell with events indicator
  const renderDay = (date: Date) => {
    const hasTask = tasks.some(task => task.dueDate && isSameDay(new Date(task.dueDate), date));
    const hasMeeting = meetings.some(meeting => isSameDay(new Date(meeting.date), date));
    
    return (
      <div className="relative">
        {hasTask && (
          <div
            className="absolute top-1 left-1 w-2 h-2 rounded-full bg-blue-500"
            title="Task due"
          />
        )}
        {hasMeeting && (
          <div
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-green-500"
            title="Meeting scheduled"
          />
        )}
        <span>{format(date, 'd')}</span>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Calendar</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Calendar Card */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Date</CardTitle>
            <CardDescription>View tasks and meetings for the selected date.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>
        
        {/* Events List Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate ? format(selectedDate, "PPP") : "Select a Date"}
            </CardTitle>
            <CardDescription>
              Tasks and meetings scheduled for the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate ? (
              <>
                {/* Tasks List */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Tasks</h3>
                  {tasksForSelectedDate.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {tasksForSelectedDate.map((task) => (
                        <li key={task.id}>
                          {task.title}
                          {task.contactName && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Contact: {task.contactName})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No tasks for this date.</p>
                  )}
                </div>
                
                {/* Meetings List */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Meetings</h3>
                  {meetingsForSelectedDate.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {meetingsForSelectedDate.map((meeting) => (
                        <li key={meeting.id}>
                          {meeting.type} at {meeting.time}
                          {meeting.contactName && (
                            <span className="ml-2 text-sm text-muted-foreground">
                              (Contact: {meeting.contactName})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">No meetings for this date.</p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Please select a date to view events.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
