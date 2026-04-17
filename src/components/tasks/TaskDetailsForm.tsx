
import React from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Task } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
} from "@/components/ui/form";
import { TaskTitleField } from "./fields/TaskTitleField";
import { TaskPriorityField } from "./fields/TaskPriorityField";
import { TaskDateField } from "./fields/TaskDateField";
import { TaskTimeField } from "./fields/TaskTimeField";
import { TaskContactField } from "./fields/TaskContactField";
import { TaskDescriptionField } from "./fields/TaskDescriptionField";
import { useAuth } from "@/context/AuthContext";
import { useAgents } from "@/hooks/useAgents";

// Define the schema for task validation
const taskSchema = z.object({
  title: z.string({
    required_error: "Title is required",
  }),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  dueTime: z.string().optional(),
  priority: z.enum(["low", "medium", "high"], {
    required_error: "Priority is required",
  }),
  contactId: z.string().optional(),
  status: z.enum(["active", "completed"]).default("active"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskDetailsFormProps {
  task?: Task;
  contactId?: string;
  isEditing?: boolean;
  isSubmitting: boolean;
  onSubmit: (data: TaskFormValues & { agentId?: string; agentName?: string }) => void;
  onCancel: () => void;
}

export const TaskDetailsForm = ({
  task,
  contactId,
  isEditing = false,
  isSubmitting,
  onSubmit,
  onCancel,
}: TaskDetailsFormProps) => {
  const { isAdmin, user } = useAuth();
  const agents = useAgents();
  const [selectedAgentId, setSelectedAgentId] = React.useState(task?.agentId || user?.id || "");
  const defaultValues: Partial<TaskFormValues> = {
    title: task?.title || "",
    description: task?.description || "",
    dueDate: task?.dueDate ? new Date(task.dueDate) : undefined,
    dueTime: task?.dueTime || "",
    priority: task?.priority || "medium",
    contactId: contactId || task?.contactId || "none",
    status: task?.status || "active",
  };

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues,
  });

  const handleSubmit = (data: TaskFormValues) => {
    const agent = agents.find(a => a.id === selectedAgentId);
    onSubmit({
      ...data,
      agentId: selectedAgentId || undefined,
      agentName: agent?.name || undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => <TaskTitleField field={field} />}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => <TaskPriorityField field={field} />}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => <TaskDateField field={field} />}
            />
            
            <FormField
              control={form.control}
              name="dueTime"
              render={({ field }) => <TaskTimeField field={field} />}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="contactId"
          render={({ field }) => (
            <TaskContactField 
              field={field} 
              disabled={!!contactId} 
            />
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => <TaskDescriptionField field={field} />}
        />

        {isAdmin && agents.length > 0 && (
          <div className="space-y-1">
            <Label>Assigned Agent</Label>
            <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agents.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-[#0EA5E9] hover:bg-[#0EA5E9]/90">
            {isSubmitting ? "Saving..." : isEditing ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
