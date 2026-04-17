import { useState, useCallback, useEffect } from "react";
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const formatTask = (row: Record<string, unknown>): Task => ({
  id: row.id as string,
  title: row.title as string,
  description: (row.description as string) || '',
  status: (row.status === "completed" ? "completed" : "active") as Task["status"],
  priority: row.priority as "low" | "medium" | "high",
  dueDate: (row.due_date as string) || undefined,
  dueTime: (row.due_time as string) || '',
  contactId: (row.contact_id as string) || '',
  contactName: '',
  agentId: (row.agent_id as string) || '',
  agentName: (row.agent_name as string) || '',
  createdAt: new Date(row.created_at as string),
  updatedAt: new Date(row.updated_at as string),
});

export const useTasksFetch = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
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

      const formattedTasks = (data || []).map(t => formatTask(t as Record<string, unknown>));
      setTasks(formattedTasks);
    } catch (error) {
      console.error('useTasksFetch: Error in fetchTasks:', error);
      toast.error("Error", {
        description: "Failed to load tasks. Please check your connection and try again.",
      });
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [formatTask(payload.new as Record<string, unknown>), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => t.id === payload.new.id ? formatTask(payload.new as Record<string, unknown>) : t));
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id));
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAuthenticated, user?.id]);

  return {
    tasks,
    setTasks,
    loading,
    fetchTasks
  };
};
