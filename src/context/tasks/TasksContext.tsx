
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useTasksOperations } from "./useTasksOperations";
import { TasksContextType } from "./types";
import { useAuth } from "@/context/AuthContext";
import { useOrganizations } from "@/context/organizations/OrganizationsContext";

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { currentOrganization } = useOrganizations();
  const operations = useTasksOperations();

  // Fetch tasks when the component mounts or when auth/org state changes
  useEffect(() => {
    if (isAuthenticated && currentOrganization) {
      console.log("TasksContext: User authenticated and organization set, fetching tasks");
      operations.refreshTasks();
    } else {
      console.log("TasksContext: Missing auth or organization, skipping tasks fetch");
    }
  }, [isAuthenticated, currentOrganization?.id]);

  // Utility methods
  const getTaskById = (id: string) => {
    return operations.tasks.find(task => task.id === id);
  };

  const getTasksByContactId = (contactId: string) => {
    return operations.tasks.filter(task => task.contactId === contactId);
  };

  const getTasksByAgentId = (agentId: string) => {
    return operations.tasks.filter(task => task.agentId === agentId);
  };

  const getTasksByStatus = (status: "active" | "completed") => {
    return operations.tasks.filter(task => task.status === status);
  };

  return (
    <TasksContext.Provider value={{
      ...operations,
      getTaskById,
      getTasksByContactId,
      getTasksByAgentId,
      getTasksByStatus,
    }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = (): TasksContextType => {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
};
