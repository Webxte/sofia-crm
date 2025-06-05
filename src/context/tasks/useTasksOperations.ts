
import { useTasksFetch } from "./hooks/useTasksFetch";
import { useTaskCRUD } from "./hooks/useTaskCRUD";

export const useTasksOperations = () => {
  const { tasks, setTasks, loading, fetchTasks } = useTasksFetch();
  const { addTask: addTaskBase, updateTask: updateTaskBase, deleteTask: deleteTaskBase, loading: crudLoading } = useTaskCRUD();

  const addTask = async (taskData: Parameters<typeof addTaskBase>[0]) => {
    const result = await addTaskBase(taskData);
    await fetchTasks(); // Refresh tasks after adding
    return result;
  };

  const updateTask = async (id: string, taskData: Parameters<typeof updateTaskBase>[1]) => {
    const result = await updateTaskBase(id, taskData);
    await fetchTasks(); // Refresh tasks after updating
    return result;
  };

  const deleteTask = async (id: string) => {
    const result = await deleteTaskBase(id);
    await fetchTasks(); // Refresh tasks after deleting
    return result;
  };

  const refreshTasks = async () => {
    await fetchTasks();
  };

  const getTaskById = (id: string) => {
    return tasks.find(task => task.id === id);
  };

  const getTasksByContactId = (contactId: string) => {
    return tasks.filter(task => task.contactId === contactId);
  };

  const getTasksByAgentId = (agentId: string) => {
    return tasks.filter(task => task.agentId === agentId);
  };

  const getTasksByStatus = (status: "active" | "completed") => {
    return tasks.filter(task => task.status === status);
  };

  return {
    tasks,
    loading: loading || crudLoading,
    addTask,
    updateTask,
    deleteTask,
    refreshTasks,
    fetchTasks,
    getTaskById,
    getTasksByContactId,
    getTasksByAgentId,
    getTasksByStatus,
  };
};
