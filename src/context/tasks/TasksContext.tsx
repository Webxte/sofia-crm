
import { createContext, useContext, useEffect, ReactNode } from "react";
import { TasksContextType } from "./types";
import { useTasksOperations } from "./useTasksOperations";
import { getTaskById, getTasksByContactId } from "./taskUtils";
import { useAuth } from "@/context/AuthContext";

const TasksContext = createContext<TasksContextType | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { 
    tasks, 
    loading, 
    addTask, 
    updateTask, 
    deleteTask, 
    refreshTasks 
  } = useTasksOperations();

  useEffect(() => {
    if (isAuthenticated) {
      refreshTasks();
    }
  }, [isAuthenticated]);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        getTaskById: (id) => getTaskById(tasks, id),
        getTasksByContactId: (contactId) => getTasksByContactId(tasks, contactId),
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
