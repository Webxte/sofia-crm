
import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { useTasksOperations } from "./useTasksOperations";
import { TasksContextType } from "./types";

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const operations = useTasksOperations();
  
  // Auto-fetch tasks when the provider mounts
  useEffect(() => {
    console.log("TasksProvider: Initializing, fetching tasks");
    operations.fetchTasks();
  }, []);
  
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
