
import React from "react";
import { Helmet } from "react-helmet-async";
import TaskForm from "@/components/tasks/TaskForm";
import { useLocation } from "react-router-dom";

const NewTask = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const contactId = queryParams.get("contactId");

  return (
    <>
      <Helmet>
        <title>Add Task | CRM</title>
      </Helmet>
      <TaskForm contactId={contactId || undefined} />
    </>
  );
};

export default NewTask;
