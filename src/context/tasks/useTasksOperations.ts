
import { useState, useCallback } from "react";
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";
import { useToast } from "@/hooks/use-toast";

// Transform database task to app task
const transformDatabaseTask = (dbTask: any): Task => {
  return {
    id: dbTask.id,
    organizationId: dbTask.organization_id,
    contactId: dbTask.contact_id,
    title: dbTask.title,
    description: dbTask.description,
    dueDate: dbTask.due_date,
    dueTime: dbTask.due_time,
    priority: dbTask.priority as "low" | "medium" | "high",
    status: dbTask.status as "active" | "completed",
    contactName: dbTask.contact_name,
    agentId: dbTask.agent_id,
    agentName: dbTask.agent_name,
    createdAt: new Date(dbTask.created_at),
    updatedAt: new Date(dbTask.updated_at),
  };
};

// Transform app task to database task
const transformAppTask = (task: Partial<Task>): any => {
  return {
    organization_id: task.organizationId,
    contact_id: task.contactId,
    title: task.title,
    description: task.description,
    due_date: task.dueDate,
    due_time: task.dueTime,
    priority: task.priority,
    status: task.status,
    contact_name: task.contactName,
    agent_id: task.agentId,
    agent_name: task.agentName,
    updated_at: new Date().toISOString(),
  };
};

export const useTasksOperations = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();
  const { toast } = useToast();

  const fetchTasks = useCallback(async () => {
    if (!user || !currentOrganization) {
      console.log("No user or organization, skipping tasks fetch");
      return;
    }

    setLoading(true);
    try {
      console.log("Fetching tasks for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("organization_id", currentOrganization.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedTasks = data?.map(transformDatabaseTask) || [];
      console.log(`Fetched ${transformedTasks.length} tasks`);
      setTasks(transformedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, currentOrganization]);

  const addTask = useCallback(async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbTask = {
        ...transformAppTask(taskData),
        organization_id: currentOrganization.id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("tasks")
        .insert([dbTask])
        .select()
        .single();

      if (error) throw error;

      const newTask = transformDatabaseTask(data);
      setTasks(prev => [newTask, ...prev]);
      
      return newTask;
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Error",
        description: "Failed to add task. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, toast]);

  const updateTask = useCallback(async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const dbTask = transformAppTask(taskData);

      const { data, error } = await supabase
        .from("tasks")
        .update(dbTask)
        .eq("id", id)
        .eq("organization_id", currentOrganization.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTask = transformDatabaseTask(data);
      setTasks(prev => prev.map(task => 
        task.id === id ? updatedTask : task
      ));
      
      return updatedTask;
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, currentOrganization, toast]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    if (!user || !currentOrganization) {
      throw new Error("User or organization not found");
    }

    try {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("organization_id", currentOrganization.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error",
        description: "Failed to delete task. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user, currentOrganization, toast]);

  // Utility functions
  const getTaskById = useCallback((id: string): Task | undefined => {
    return tasks.find(task => task.id === id);
  }, [tasks]);

  const getTasksByContactId = useCallback((contactId: string): Task[] => {
    return tasks.filter(task => task.contactId === contactId);
  }, [tasks]);

  const getTasksByAgentId = useCallback((agentId: string): Task[] => {
    return tasks.filter(task => task.agentId === agentId);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: "active" | "completed"): Task[] => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    getTaskById,
    getTasksByContactId,
    getTasksByAgentId,
    getTasksByStatus,
    refreshTasks: fetchTasks
  };
};
