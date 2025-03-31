
import { Task } from "@/types";

export interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByContactId: (contactId: string) => Task[];
  refreshTasks: () => Promise<void>;
}

// Interface for task data sent to Supabase
export interface TaskData {
  title: string;
  description?: string;
  due_date?: string | null;
  due_time?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  contact_id?: string | null;
  agent_id?: string;
  agent_name?: string;
  updated_at?: string;
}
