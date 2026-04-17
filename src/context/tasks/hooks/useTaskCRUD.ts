import { useState } from "react";
import { addDays, addWeeks, addMonths, format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types";
import { useAuth } from "@/context/AuthContext";

function nextDueDate(current: string, recurrence: Task["recurrence"]): string {
  const d = new Date(current);
  if (recurrence === "daily")   return format(addDays(d, 1), "yyyy-MM-dd");
  if (recurrence === "weekly")  return format(addWeeks(d, 1), "yyyy-MM-dd");
  if (recurrence === "monthly") return format(addMonths(d, 1), "yyyy-MM-dd");
  return current;
}

export const useTaskCRUD = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    if (!user) throw new Error("User not authenticated");
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .insert([{
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.dueDate,
          due_time: taskData.dueTime,
          contact_id: taskData.contactId,
          agent_id: user.id,
          agent_name: user.user_metadata?.name || user.email,
          recurrence: taskData.recurrence || 'none',
        }])
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority as Task["priority"],
        status: data.status as Task["status"],
        dueDate: data.due_date,
        dueTime: data.due_time,
        contactId: data.contact_id,
        agentId: data.agent_id,
        agentName: data.agent_name,
        recurrence: (data.recurrence || 'none') as Task["recurrence"],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      toast.success("Success", {
        description: "Task created successfully",
      });

      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error("Error", {
        description: "Failed to create task",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>, existingTask?: Task) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          status: taskData.status,
          due_date: taskData.dueDate,
          due_time: taskData.dueTime,
          contact_id: taskData.contactId,
          ...(taskData.agentId   !== undefined && { agent_id:   taskData.agentId }),
          ...(taskData.agentName !== undefined && { agent_name: taskData.agentName }),
          ...(taskData.recurrence !== undefined && { recurrence: taskData.recurrence }),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      const updatedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        priority: data.priority as Task["priority"],
        status: data.status as Task["status"],
        dueDate: data.due_date,
        dueTime: data.due_time,
        contactId: data.contact_id,
        agentId: data.agent_id,
        agentName: data.agent_name,
        recurrence: (data.recurrence || 'none') as Task["recurrence"],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      // Auto-create next occurrence when a recurring task is completed
      const recurrence = updatedTask.recurrence || existingTask?.recurrence;
      if (taskData.status === 'completed' && recurrence && recurrence !== 'none') {
        const baseDueDate = updatedTask.dueDate || existingTask?.dueDate;
        const newDueDate = baseDueDate ? nextDueDate(baseDueDate, recurrence) : undefined;
        await supabase.from("tasks").insert([{
          title: updatedTask.title,
          description: updatedTask.description,
          priority: updatedTask.priority,
          status: 'active',
          due_date: newDueDate,
          due_time: updatedTask.dueTime || existingTask?.dueTime,
          contact_id: updatedTask.contactId || existingTask?.contactId,
          agent_id: updatedTask.agentId,
          agent_name: updatedTask.agentName,
          recurrence,
        }]);
        toast.success("Recurring task scheduled", {
          description: `Next occurrence created for ${newDueDate || 'no date'}.`,
        });
      } else {
        toast.success("Success", { description: "Task updated successfully" });
      }

      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      toast.error("Error", {
        description: "Failed to update task",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Success", {
        description: "Task deleted successfully",
      });

      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      toast.error("Error", {
        description: "Failed to delete task",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addTask,
    updateTask,
    deleteTask,
    loading,
  };
};
