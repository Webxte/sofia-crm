
import { useState } from "react";
import { Calendar, Plus, MessagesSquare, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Meetings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const meetings = []; // This would be populated from your backend

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
          <p className="text-muted-foreground mt-1">
            Schedule and manage your meetings
          </p>
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" /> Schedule Meeting
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search meetings..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" /> View Calendar
          </Button>
          <Button variant="outline" size="sm">
            Filter
          </Button>
        </div>
      </div>

      {meetings.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<MessagesSquare size={40} />}
            title="No meetings scheduled"
            description="Schedule your first meeting to get started."
            actionText="Schedule Meeting"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed">
          {/* Meetings table would go here */}
        </div>
      )}
    </div>
  );
};

export default Meetings;
