
import { useTasksFetch } from "./hooks/useTasksFetch";
import { useTaskCRUD } from "./hooks/useTaskCRUD";

export const useTasksOperations = () => {
  const { tasks, setTasks, loading, fetchTasks } = useTasksFetch();
  const { addTask: addTaskBase, updateTask: updateTaskBase, deleteTask: deleteTaskBase, sendTaskEmail } = useTaskCRUD();

  // Wrap CRUD operations to pass setTasks
  const addTask = (taskData: Parameters<typeof addTaskBase>[0]) => 
    addTaskBase(taskData, setTasks);

  const updateTask = (id: string, taskData: Parameters<typeof updateTaskBase>[1]) => 
    updateTaskBase(id, taskData, setTasks);

  const deleteTask = (id: string) => 
    deleteTaskBase(id, setTasks);

  const refreshTasks = async () => {
    await fetchTasks();
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks,
    fetchTasks,
    sendTaskEmail,
  };
};
