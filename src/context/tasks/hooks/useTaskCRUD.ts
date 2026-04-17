import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Task } from "@/types";
import { useAuth } from "@/context/AuthContext";

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

  const updateTask = async (id: string, taskData: Partial<Task>) => {
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
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      toast.success("Success", {
        description: "Task updated successfully",
      });

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
