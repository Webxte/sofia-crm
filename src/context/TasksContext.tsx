
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Task } from "@/types";
import { useAuth } from "./AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  completeTask: (id: string) => Promise<void>;
  getTasksByAgentId: (agentId: string) => Task[];
  refreshTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch tasks when the component mounts or when user auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Function to fetch tasks from Supabase
  const refreshTasks = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated) {
        setTasks([]);
        return;
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching tasks:', error);
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
        return;
      }
      
      // Transform the Supabase data to match our Task type
      const formattedTasks: Task[] = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: task.due_date ? new Date(task.due_date) : undefined,
        dueTime: task.due_time,
        priority: task.priority as "low" | "medium" | "high",
        status: task.status as "active" | "completed",
        contactId: task.contact_id,
        agentId: task.agent_id,
        agentName: task.agent_name,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at),
      }));
      
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
      
      // Add agent information
      const agentData = {
        agent_id: user.id,
        agent_name: user.name || ''
      };
      
      // Convert Task type to Supabase table format (snake_case)
      const newTaskData = {
        title: taskData.title,
        description: taskData.description,
        due_date: taskData.dueDate,
        due_time: taskData.dueTime,
        priority: taskData.priority,
        status: taskData.status,
        contact_id: taskData.contactId,
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
      
      // Transform and add the new task to state
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        dueTime: data.due_time,
        priority: data.priority as "low" | "medium" | "high",
        status: data.status as "active" | "completed",
        contactId: data.contact_id,
        agentId: data.agent_id,
        agentName: data.agent_name,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
      
      setTasks(prevTasks => [newTask, ...prevTasks]);
      
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
      // Convert Task type to Supabase table format (snake_case)
      const updateData: any = {};
      
      if (taskData.title !== undefined) updateData.title = taskData.title;
      if (taskData.description !== undefined) updateData.description = taskData.description;
      if (taskData.dueDate !== undefined) updateData.due_date = taskData.dueDate;
      if (taskData.dueTime !== undefined) updateData.due_time = taskData.dueTime;
      if (taskData.priority !== undefined) updateData.priority = taskData.priority;
      if (taskData.status !== undefined) updateData.status = taskData.status;
      if (taskData.contactId !== undefined) updateData.contact_id = taskData.contactId;
      
      // Add updated_at
      updateData.updated_at = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error('Error updating task:', error);
        toast({
          title: "Error",
          description: "Failed to update task",
          variant: "destructive",
        });
        return;
      }
      
      // Update the task in state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === id 
            ? {
                ...task,
                title: data.title,
                description: data.description,
                dueDate: data.due_date ? new Date(data.due_date) : undefined,
                dueTime: data.due_time,
                priority: data.priority,
                status: data.status,
                contactId: data.contact_id,
                updatedAt: new Date(data.updated_at)
              }
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
      
      // Remove the task from state
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

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const completeTask = async (id: string) => {
    await updateTask(id, { status: "completed" });
  };

  const getTasksByAgentId = (agentId: string) => {
    return tasks.filter(task => task.agentId === agentId);
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        getTaskById,
        completeTask,
        getTasksByAgentId,
        refreshTasks,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
