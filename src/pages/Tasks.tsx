
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks } from '@/context/TasksContext';
import { Task } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, ListFilter } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { EmptyState } from '@/components/EmptyState';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Helmet } from 'react-helmet-async';

const Tasks = () => {
  const { tasks } = useTasks();
  const navigate = useNavigate();
  
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTasks = tasks
    .filter(task => {
      if (filterStatus === 'all') return true;
      return task.status === filterStatus;
    })
    .filter(task => {
      if (filterPriority === 'all') return true;
      return task.priority === filterPriority;
    })
    .filter(task => {
      if (!searchQuery) return true;
      return (
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

  const handleCreateTask = () => {
    navigate('/tasks/new');
  };

  const handleViewTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  return (
    <>
      <Helmet>
        <title>Tasks | CRM</title>
      </Helmet>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">Manage your tasks and to-dos</p>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="w-full md:w-72">
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="w-full md:w-32">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-32">
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full md:w-60 grid-cols-2">
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
          
          <TabsContent value="list" className="mt-4">
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onViewDetails={() => handleViewTask(task.id)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListFilter size={40} />}
                title="No tasks found"
                description="Try changing your filters or create a new task."
                actionText="Create Task"
                actionLink="/tasks/new"
              />
            )}
          </TabsContent>
          
          <TabsContent value="grid" className="mt-4">
            {filteredTasks.length > 0 ? (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onViewDetails={() => handleViewTask(task.id)} 
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<ListFilter size={40} />}
                title="No tasks found"
                description="Try changing your filters or create a new task."
                actionText="Create Task"
                actionLink="/tasks/new"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Tasks;
