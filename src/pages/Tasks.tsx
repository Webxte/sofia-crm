import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ClipboardList, Plus, Search, Filter, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTasks } from "@/context/TasksContext";
import { useContacts } from "@/context/ContactsContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const { tasks, completeTask } = useTasks();
  const { getContactById } = useContacts();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");
  
  const filteredTasks = tasks.filter(task => {
    if (contactId && task.contactId !== contactId) {
      return false;
    }
    
    if (filterStatus !== "all" && task.status !== filterStatus) {
      return false;
    }
    
    if (filterPriority !== "all" && task.priority !== filterPriority) {
      return false;
    }
    
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      const title = task.title.toLowerCase();
      const description = task.description?.toLowerCase() || "";
      
      let contactMatch = false;
      if (task.contactId) {
        const contact = getContactById(task.contactId);
        if (contact) {
          const contactName = contact.fullName?.toLowerCase() || "";
          const contactCompany = contact.company?.toLowerCase() || "";
          contactMatch = contactName.includes(searchLower) || contactCompany.includes(searchLower);
        }
      }
      
      return title.includes(searchLower) || 
             description.includes(searchLower) || 
             contactMatch;
    }
    
    return true;
  });
  
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleCompleteTask = (id: string) => {
    completeTask(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage tasks for your team
          </p>
        </div>
        <Button className="sm:w-auto w-full" asChild>
          <Link to={contactId ? `/tasks/new?contactId=${contactId}` : "/tasks/new"}>
            <Plus className="mr-2 h-4 w-4" /> Create Task
          </Link>
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
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedTasks.length === 0 ? (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <EmptyState
            icon={<ClipboardList size={40} />}
            title="No tasks created"
            description="Start creating tasks to track your work."
            actionText="Create Task"
            actionLink="/tasks/new"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTasks.map((task) => {
            const contact = task.contactId ? getContactById(task.contactId) : null;
            return (
              <Card 
                key={task.id} 
                className={`overflow-hidden ${task.status === 'completed' ? 'bg-muted/50' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Badge
                      className={getPriorityColor(task.priority)}
                      variant="outline"
                    >
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </Badge>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/tasks/${task.id}`)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/tasks/edit/${task.id}`)}>
                          Edit Task
                        </DropdownMenuItem>
                        {task.status === "active" && (
                          <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                            Mark as Completed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className={`text-xl ${task.status === 'completed' ? 'line-through opacity-75' : ''}`}>
                    {task.title}
                  </CardTitle>
                  {task.dueDate && (
                    <CardDescription>
                      Due: {format(new Date(task.dueDate), "PPP")}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  {contact && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Contact: </span>
                      <span>
                        {contact.fullName || contact.company || "Unnamed Contact"}
                      </span>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  {task.status === "active" ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCompleteTask(task.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark as Completed
                    </Button>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center py-1">
                      Completed
                    </Badge>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Tasks;
