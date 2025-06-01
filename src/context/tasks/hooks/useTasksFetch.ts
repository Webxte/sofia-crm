
import { useState, useCallback } from "react";
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useTasksFetch = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { currentOrganization } = useOrganizations();

  const fetchTasks = useCallback(async () => {
    if (!currentOrganization) {
      console.log("useTasksFetch: No current organization, skipping tasks fetch");
      return;
    }

    try {
      setLoading(true);
      console.log("useTasksFetch: Fetching tasks for organization:", currentOrganization.id, currentOrganization.name);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('organization_id', currentOrganization.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useTasksFetch: Error fetching tasks:', error);
        throw error;
      }

      console.log("useTasksFetch: Raw tasks data from Supabase:", data);

      const formattedTasks: Task[] = (data || []).map(task => ({
        id: task.id,
        organizationId: task.organization_id,
        title: task.title,
        description: task.description || '',
        status: task.status as "active" | "completed",
        priority: task.priority as "low" | "medium" | "high",
        dueDate: task.due_date || undefined,
        dueTime: task.due_time || undefined,
        contactId: task.contact_id || '',
        agentId: task.agent_id || '',
        agentName: task.agent_name || '',
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
      }));

      console.log(`useTasksFetch: Formatted ${formattedTasks.length} tasks for organization ${currentOrganization.name}`);
      setTasks(formattedTasks);
    } catch (error) {
      console.error('useTasksFetch: Error in fetchTasks:', error);
      toast({
        title: "Error",
        description: "Failed to load tasks. Please check your connection and try again.",
        variant: "destructive",
      });
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [currentOrganization, toast]);

  return {
    tasks,
    setTasks,
    loading,
    fetchTasks
  };
};
