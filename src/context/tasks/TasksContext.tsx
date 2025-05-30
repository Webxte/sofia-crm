
import React, { createContext, useContext, useEffect, ReactNode } from "react";
import { useTasksOperations } from "./useTasksOperations";
import { TasksContextType } from "./types";
import { useAuth } from "@/context/AuthContext";

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const operations = useTasksOperations();

  // Fetch tasks when the component mounts or when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      operations.refreshTasks();
    }
  }, [isAuthenticated]);

  return (
    <TasksContext.Provider value={operations}>
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
