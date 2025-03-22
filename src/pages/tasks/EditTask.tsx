
import { useParams, Navigate } from "react-router-dom";
import { useTasks } from "@/context/TasksContext";
import TaskForm from "@/components/tasks/TaskForm";

const EditTask = () => {
  const { id } = useParams();
  const { getTaskById } = useTasks();
  
  const task = id ? getTaskById(id) : undefined;
  
  if (!task) {
    return <Navigate to="/tasks" replace />;
  }
  
  return <TaskForm task={task} isEditing />;
};

export default EditTask;
