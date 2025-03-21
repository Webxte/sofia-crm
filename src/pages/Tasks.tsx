
import { useState } from "react";
import { ClipboardList, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const tasks = []; // This would be populated from your backend

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage tasks for your team
          </p>
        </div>
        <Button className="sm:w-auto w-full">
          <Plus className="mr-2 h-4 w-4" /> Create Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          <Button variant="outline" size="sm">
            Filter
          </Button>
          <Button variant="outline" size="sm">
            Sort
          </Button>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<ClipboardList size={40} />}
            title="No tasks created"
            description="Start creating tasks to track your work."
            actionText="Create Task"
          />
        </div>
      ) : (
        <div className="rounded-lg border border-dashed">
          {/* Tasks list would go here */}
        </div>
      )}
    </div>
  );
};

export default Tasks;
