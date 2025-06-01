
import { Task } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

export const useTaskCRUD = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const { currentOrganization } = useOrganizations();

  const addTask = async (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt">,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  ): Promise<Task | null> => {
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
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate || null,
        due_time: taskData.dueTime,
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
        status: data.status as "active" | "completed",
        priority: data.priority as "low" | "medium" | "high",
        dueDate: data.due_date || undefined,
        dueTime: data.due_time || undefined,
        contactId: data.contact_id || '',
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

  const updateTask = async (
    id: string, 
    taskData: Partial<Task>,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  ): Promise<Task | null> => {
    try {
      const updateData = {
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        priority: taskData.priority,
        due_date: taskData.dueDate || null,
        due_time: taskData.dueTime,
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
        status: data.status as "active" | "completed",
        priority: data.priority as "low" | "medium" | "high",
        dueDate: data.due_date || undefined,
        dueTime: data.due_time || undefined,
        contactId: data.contact_id || '',
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

  const deleteTask = async (
    id: string,
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>
  ): Promise<boolean> => {
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

  const sendTaskEmail = async (taskId: string, emailData: any): Promise<boolean> => {
    // Implementation for sending task emails would go here
    console.log("Task email not yet implemented");
    return false;
  };

  return {
    addTask,
    updateTask,
    deleteTask,
    sendTaskEmail,
  };
};
