
import { Task } from "@/types";

export interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => Promise<Task | null>;
  updateTask: (id: string, taskData: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  getTaskById: (id: string) => Task | undefined;
  getTasksByContactId: (contactId: string) => Task[];
  getTasksByAgentId: (agentId: string) => Task[];
  getTasksByStatus: (status: "active" | "completed") => Task[];
  refreshTasks: () => Promise<void>;
}

export interface TaskData {
  title: string;
  description?: string;
  due_date?: string | null;
  due_time?: string;
  priority: "low" | "medium" | "high";
  status: "active" | "completed";
  contact_id?: string | null;
  contact_name?: string;
  agent_id?: string;
  agent_name?: string;
}
