
import { useState } from "react";
import { Calendar as CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("month");

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your schedule
          </p>
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" /> Add Event
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex items-center">
          <Button variant="outline" className="rounded-r-none border-r-0">
            Today
          </Button>
          <Button variant="outline" size="icon" className="rounded-none border-r-0">
            &lt;
          </Button>
          <Button variant="outline" size="icon" className="rounded-l-none">
            &gt;
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

      <div className="rounded-lg border border-border overflow-hidden bg-card">
        <div className="p-4">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="mx-auto pointer-events-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
