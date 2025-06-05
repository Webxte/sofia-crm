
import { useState, useCallback } from "react";
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

export const useTasksFetch = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuth();

  const fetchTasks = useCallback(async () => {
    // Only fetch if user is authenticated
    if (!isAuthenticated || !user) {
      console.log("useTasksFetch: Not authenticated, skipping tasks fetch");
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      console.log("useTasksFetch: Fetching all tasks for authenticated user:", user.id);
      
      // Simple query - get all tasks (RLS policies handle access control)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useTasksFetch: Error fetching tasks:', error);
        throw error;
      }

      console.log("useTasksFetch: Raw tasks data from Supabase:", data);

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.status as "active" | "completed",
        priority: task.priority as "low" | "medium" | "high",
        dueDate: task.due_date || undefined, // Keep as ISO string
        dueTime: task.due_time || '',
        contactId: task.contact_id || '',
        contactName: '', // Set empty string since contact_name doesn't exist in DB
        agentId: task.agent_id || '',
        agentName: task.agent_name || '',
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
      }));

      console.log(`useTasksFetch: Successfully formatted ${formattedTasks.length} tasks`);
      setTasks(formattedTasks);
    } catch (error) {
      console.error('useTasksFetch: Error in fetchTasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please check your connection and try again.",
        variant: "destructive",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, toast]);

  return {
    tasks,
    setTasks,
    loading,
    fetchTasks
  };
};
