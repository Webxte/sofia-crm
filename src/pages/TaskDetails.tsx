
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTasks } from '@/context/TasksContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Calendar, CheckSquare } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';

const getPriorityColor = (priority: string) => {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-slate-500';
  }
};

const TaskDetails = () => {
  const { id } = useParams();
  const { getTaskById, completeTask } = useTasks();
  
  const task = id ? getTaskById(id) : undefined;
  
  if (!task) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h2 className="text-xl font-semibold">Task not found</h2>
        <Button asChild>
          <Link to="/tasks">Back to Tasks</Link>
        </Button>
      </div>
    );
  }
  
  const handleCompleteTask = () => {
    if (id) completeTask(id);
  };
  
  return (
    <>
      <Helmet>
        <title>{task.title || 'Task'} | CRM</title>
      </Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link to="/tasks">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">{task.title}</h1>
            <div className="ml-2 flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`} />
              <span className="text-sm font-medium">{task.priority} Priority</span>
            </div>
            {task.completed && (
              <Badge className="ml-2 bg-green-500">Completed</Badge>
            )}
          </div>
          <div className="flex space-x-2">
            {!task.completed && (
              <Button variant="outline" onClick={handleCompleteTask}>
                <CheckSquare className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            <Button asChild variant="outline">
              <Link to={`/tasks/${task.id}/edit`}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Task Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className="font-medium">
                      {format(new Date(task.dueDate), 'PPP')} {task.dueTime ? `at ${task.dueTime}` : ''}
                    </p>
                  </div>
                </div>
                
                {task.contactId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Related Contact</p>
                    <p className="font-medium">
                      <Link to={`/contacts/${task.contactId}`} className="text-blue-600 hover:underline">
                        View Contact
                      </Link>
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <Separator className="my-6" />
            
            {task.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="text-sm">{task.description}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TaskDetails;
