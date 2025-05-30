
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
