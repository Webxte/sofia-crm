
import { format } from "date-fns";
import { Task } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TaskCardProps {
  task: Task;
  onViewDetails?: () => void;
}

export const TaskCard = ({ task, onViewDetails }: TaskCardProps) => {
  const navigate = useNavigate();
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
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
  
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails();
    } else {
      navigate(`/tasks/${task.id}`);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Badge
            className={getPriorityColor(task.priority)}
            variant="outline"
          >
            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
          </Badge>
          <Badge variant={task.status === "completed" ? "default" : "outline"}>
            {task.status === "completed" ? "Completed" : "Active"}
          </Badge>
        </div>
        <CardTitle className="text-xl">
          {task.title}
        </CardTitle>
        {task.dueDate && (
          <CardDescription className="flex items-center gap-1">
            Due: {format(new Date(task.dueDate), "PPP")} {task.dueTime ? `at ${task.dueTime}` : ""}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {task.description && (
          <p className="text-sm text-muted-foreground whitespace-pre-line overflow-hidden max-h-36 line-clamp-3">
            {task.description}
          </p>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={handleViewDetails}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
};
