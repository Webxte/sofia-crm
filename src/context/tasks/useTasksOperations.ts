
import { useState, useCallback } from "react";
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useTasksOperations = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const fetchTasks = useCallback(async () => {
    if (!currentOrganization) {
      console.log("No current organization, skipping tasks fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching tasks for organization:", currentOrganization.id);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        organizationId: task.organization_id,
        title: task.title,
        description: task.description || '',
        dueDate: task.due_date || undefined,
        dueTime: task.due_time || undefined,
        priority: task.priority as "low" | "medium" | "high",
        status: task.status as "active" | "completed",
        contactId: task.contact_id || undefined,
        agentId: task.agent_id || '',
        agentName: task.agent_name || '',
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
      }));

      console.log("Fetched tasks:", formattedTasks.length);
      setTasks(formattedTasks);
    } catch (error) {
      console.error('Error in fetchTasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">): Promise<Task | null> => {
    if (!currentOrganization) {
      toast({
        title: "Error",
        description: "No organization selected",
        variant: "destructive",
      });
      return null;
    }

    try {
      const newTask = {
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.dueDate,
        due_time: taskData.dueTime,
        priority: taskData.priority,
        status: taskData.status,
        contact_id: taskData.contactId,
        agent_id: taskData.agentId || user?.id,
        agent_name: taskData.agentName || user?.user_metadata?.name || 'Unknown',
        organization_id: currentOrganization.id,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([newTask])
        .select()
        .single();

      if (error) throw error;

      const formattedTask: Task = {
        id: data.id,
        organizationId: data.organization_id,
        title: data.title,
        description: data.description || '',
        dueDate: data.due_date || undefined,
        dueTime: data.due_time || undefined,
        priority: data.priority as "low" | "medium" | "high",
        status: data.status as "active" | "completed",
        contactId: data.contact_id || undefined,
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setTasks(prev => [formattedTask, ...prev]);
      
      toast({
        title: "Success",
        description: "Task added successfully",
      });

      return formattedTask;
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to add task",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>): Promise<Task | null> => {
    try {
      const updateData = {
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.dueDate,
        due_time: taskData.dueTime,
        priority: taskData.priority,
        status: taskData.status,
        contact_id: taskData.contactId,
        agent_id: taskData.agentId,
        agent_name: taskData.agentName,
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const formattedTask: Task = {
        id: data.id,
        organizationId: data.organization_id,
        title: data.title,
        description: data.description || '',
        dueDate: data.due_date || undefined,
        dueTime: data.due_time || undefined,
        priority: data.priority as "low" | "medium" | "high",
        status: data.status as "active" | "completed",
        contactId: data.contact_id || undefined,
        agentId: data.agent_id || '',
        agentName: data.agent_name || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };

      setTasks(prev => prev.map(task => 
        task.id === id ? formattedTask : task
      ));

      toast({
        title: "Success",
        description: "Task updated successfully",
      });

      return formattedTask;
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });

      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
      return false;
    }
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks,
    fetchTasks,
  };
};
