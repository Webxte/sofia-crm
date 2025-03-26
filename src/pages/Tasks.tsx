
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { ClipboardList, Plus, Search, Filter, CheckCircle2, Grid as GridIcon, List as ListIcon } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Tasks = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("active");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list"); // Changed default to list view
  const { tasks, updateTask } = useTasks();
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
    updateTask(id, { status: "completed" });
  };

  // Add grid view rendering function
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedTasks.map((task) => {
        const contact = task.contactId ? getContactById(task.contactId) : null;
        const contactName = contact?.company || contact?.fullName || "None";
        
        return (
          <Card key={task.id} className={task.status === 'completed' ? 'opacity-70' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className={`text-lg ${task.status === 'completed' ? 'line-through' : ''}`}>
                    {task.title}
                  </CardTitle>
                  {contactName !== "None" && (
                    <CardDescription>
                      Contact: {contactName}
                    </CardDescription>
                  )}
                </div>
                <Badge
                  className={getPriorityColor(task.priority)}
                  variant="outline"
                >
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-2">
              {task.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              {task.dueDate && (
                <div className="flex items-center mt-2 text-sm">
                  <span className="font-medium">Due:</span>
                  <span className="ml-2">
                    {format(new Date(task.dueDate), "PPP")}
                    {task.dueTime && ` at ${task.dueTime}`}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="pt-1 flex justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate(`/tasks/edit/${task.id}`)}
              >
                View
              </Button>
              {task.status === "active" && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleCompleteTask(task.id)}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );

  // Add list view rendering function
  const renderListView = () => (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedTasks.map((task) => {
            const contact = task.contactId ? getContactById(task.contactId) : null;
            const contactName = contact?.company || contact?.fullName || "None";
            
            return (
              <TableRow key={task.id} className={task.status === 'completed' ? 'bg-muted/50' : ''}>
                <TableCell className={`font-medium ${task.status === 'completed' ? 'line-through opacity-75' : ''}`}>
                  {task.title}
                </TableCell>
                <TableCell>
                  <Badge
                    className={getPriorityColor(task.priority)}
                    variant="outline"
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {task.dueDate ? format(new Date(task.dueDate), "PPP") : "-"}
                </TableCell>
                <TableCell>{contactName}</TableCell>
                <TableCell>
                  <Badge variant={task.status === "completed" ? "outline" : "default"}>
                    {task.status === "completed" ? "Completed" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => navigate(`/tasks/edit/${task.id}`)}
                    >
                      View
                    </Button>
                    {task.status === "active" && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleCompleteTask(task.id)}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Complete
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

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
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <GridIcon className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none"
            >
              <ListIcon className="h-4 w-4" />
            </Button>
          </div>
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
        viewMode === "grid" ? renderGridView() : renderListView()
      )}
    </div>
  );
};

export default Tasks;
