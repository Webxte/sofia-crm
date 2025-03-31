
import React from "react";
import TaskForm from "@/components/tasks/TaskForm";
import { useLocation } from "react-router-dom";

const NewTask = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");

  return (
    <TaskForm contactId={contactId || undefined} />
  );
};

export default NewTask;
