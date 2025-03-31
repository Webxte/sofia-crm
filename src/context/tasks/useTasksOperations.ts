
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { formatTaskFromDatabase, formatTaskForDatabase } from "./taskUtils";
import { TaskData } from "./types";

export const useTasksOperations = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshTasks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
        return;
      }
      
      const formattedTasks: Task[] = data.map(formatTaskFromDatabase);
      setTasks(formattedTasks);
    } catch (err) {
      console.error('Unexpected error fetching tasks:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while loading tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to add tasks",
          variant: "destructive",
        });
        return;
      }
      
      const agentData = {
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      const newTaskData = {
        ...formatTaskForDatabase(taskData),
        ...agentData
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTaskData)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding task:', error);
        toast({
          title: "Error",
          description: "Failed to add task",
          variant: "destructive",
        });
        return;
      }
      
      const newTask: Task = formatTaskFromDatabase(data);
      setTasks(prevTasks => [...prevTasks, newTask]);
      
      toast({
        title: "Success",
        description: "Task added successfully",
      });
    } catch (err) {
      console.error('Unexpected error adding task:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const updateTask = async (id: string, taskData: Partial<Task>) => {
    try {
      const updateData: TaskData = formatTaskForDatabase(taskData);
      updateData.updated_at = new Date().toISOString();
      
      console.log('Updating task with ID:', id, 'Data:', updateData);
      
      const { error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        return;
      }
      
      // Since we're not using .select() we don't get data back, so let's fetch it
      const { data: updatedTask, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) {
        console.error('Error fetching updated task:', fetchError);
        // Refresh all tasks as a fallback
        await refreshTasks();
        return;
      }
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id 
            ? formatTaskFromDatabase(updatedTask)
            : task
        )
      );
      
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    } catch (err) {
      console.error('Unexpected error updating task:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting task:', error);
        toast({
          title: "Error",
          description: "Failed to delete task",
          variant: "destructive",
        });
        return;
      }
      
      setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
      
      toast({
        title: "Success",
        description: "Task deleted successfully",
      });
    } catch (err) {
      console.error('Unexpected error deleting task:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks,
    setTasks
  };
};
