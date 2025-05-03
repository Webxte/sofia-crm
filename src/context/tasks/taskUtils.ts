
import { Task } from "@/types";
import { format } from "date-fns";
import { TaskData } from "./types";

/**
 * Formats a task from the database format to the app format
 */
export const formatTaskFromDatabase = (task: any): Task => ({
  id: task.id,
  title: task.title,
  description: task.description || "",
  dueDate: task.due_date || undefined,
  dueTime: task.due_time || "",
  priority: task.priority as "low" | "medium" | "high",
  status: task.status as "active" | "completed",
  contactId: task.contact_id,
  contactName: task.contact_name,
  agentId: task.agent_id,
  agentName: task.agent_name,
  createdAt: new Date(task.created_at),
  updatedAt: new Date(task.updated_at),
});

/**
 * Formats a task from app format to database format for update or insert
 */
export const formatTaskForDatabase = (task: Partial<Task>): TaskData => {
  const taskData: TaskData = {
    title: task.title || "",
    description: task.description,
    due_date: task.dueDate || null,
    due_time: task.dueTime,
    priority: task.priority || "medium",
    status: task.status || "active",
    contact_id: task.contactId === "none" ? null : task.contactId,
  };
  
  // Contact name needs to be added to the TaskData type
  if (task.contactName) taskData.contact_name = task.contactName;
  if (task.agentId) taskData.agent_id = task.agentId;
  if (task.agentName) taskData.agent_name = task.agentName;
  
  return taskData;
};

/**
 * Get a task by ID
 */
export const getTaskById = (tasks: Task[], id: string): Task | undefined => {
  return tasks.find(task => task.id === id);
};

/**
 * Get all tasks by contact ID
 */
export const getTasksByContactId = (tasks: Task[], contactId: string): Task[] => {
  return tasks.filter(task => task.contactId === contactId);
};
