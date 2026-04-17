import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Task } from "@/types";
import { useTasks } from "@/context/tasks";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TaskDetailsForm } from "./TaskDetailsForm";

interface TaskFormProps {
  task?: Task;
  isEditing?: boolean;
  contactId?: string;
}

const TaskForm = ({ task, isEditing = false, contactId }: TaskFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask, updateTask } = useTasks();
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const taskData = {
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate,
        dueTime: data.dueTime || "",
        priority: data.priority || "medium",
        contactId: data.contactId === "none" ? undefined : data.contactId,
        status: data.status || "active",
        recurrence: (data.recurrence || "none") as "none" | "daily" | "weekly" | "monthly",
        ...(data.agentId   && { agentId:   data.agentId }),
        ...(data.agentName && { agentName: data.agentName }),
      };
      
      if (isEditing && task) {
        updateTask(task.id, taskData);
      } else {
        addTask(taskData);
      }
      navigate("/tasks");
    } catch (error) {
      console.error(error);
      toast.error("Error", {
        description: "Something went wrong",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate("/tasks")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEditing ? "Edit Task" : "Create Task"}
        </h1>
      </div>

      <TaskDetailsForm 
        task={task}
        contactId={contactId}
        isSubmitting={isSubmitting}
        isEditing={isEditing}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/tasks")}
      />
    </div>
  );
};

export default TaskForm;
