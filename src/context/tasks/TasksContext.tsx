
import React, { createContext, useContext, ReactNode } from "react";
import { useTasksOperations } from "./useTasksOperations";
import { TasksContextType } from "./types";

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const operations = useTasksOperations();
  
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
