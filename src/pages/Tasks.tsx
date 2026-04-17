
import React, { useState, useEffect } from 'react';
import { useTasks } from '@/context/tasks';
import { useContacts } from '@/context/contacts/ContactsContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, CheckSquare, ListTodo, RefreshCcw, Trash2 } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Helmet } from 'react-helmet-async';
import { usePagination } from '@/hooks/use-pagination';
import { ContactsPagination } from '@/components/contacts/ContactsPagination';

const Tasks = () => {
  const { tasks, updateTask, deleteTask } = useTasks();
  const { getContactById } = useContacts();
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('active'); // Default to active tasks only
  
  // Filter tasks based on search query, priority, and status
  const filteredTasks = tasks.filter(task => {
    // Filter by status
    if (statusFilter !== 'all' && task.status !== statusFilter) {
      return false;
    }
    
    // Filter by priority
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = task.title.toLowerCase().includes(query);
      const matchesDescription = task.description?.toLowerCase().includes(query) || false;
      return matchesTitle || matchesDescription;
    }
    
    return true;
  });
  
  // Sort tasks by due date (closest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Tasks without due dates go to the end
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    
    // Sort by due date
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  const pagination = usePagination({ data: sortedTasks, itemsPerPage: 20 });

  useEffect(() => {
    pagination.resetPage();
  }, [searchQuery, priorityFilter, statusFilter]);

  const handleCreateTask = () => {
    navigate('/tasks/new');
  };
  
  const handleViewTask = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCompleteTask = async (taskId: string) => {
    await updateTask(taskId, { status: 'completed' });
  };

  const handleReactivateTask = async (taskId: string) => {
    await updateTask(taskId, { status: 'active' });
  };
  
  // Count tasks by status
  const activeTasks = tasks.filter(task => task.status === 'active').length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  
  return (
    <>
      <Helmet>
        <title>Tasks | CRM</title>
      </Helmet>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
            <p className="text-muted-foreground">
              Manage your tasks and follow-ups
            </p>
          </div>
          <Button onClick={handleCreateTask}>
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
        
        <div className="flex items-center gap-2 mb-4">
          <Button
            variant={statusFilter === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('active')}
          >
            Active ({activeTasks})
          </Button>
          <Button
            variant={statusFilter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('completed')}
          >
            Completed ({completedTasks})
          </Button>
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            All ({activeTasks + completedTasks})
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
          
          <div className="w-full md:w-40">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {sortedTasks.length > 0 ? (
          <div className="space-y-4">
            {pagination.paginatedData.map((task) => {
              const contact = task.contactId ? getContactById(task.contactId) : undefined;
              const contactName = contact ? (contact.company || contact.fullName || '') : '';
              
              return (
                <div
                  key={task.id}
                  className="border rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge variant={task.priority === 'high' ? 'destructive' : (task.priority === 'medium' ? 'outline' : 'secondary')}>
                          {task.priority}
                        </Badge>
                        {task.status === 'completed' && (
                          <Badge className="bg-green-500">Completed</Badge>
                        )}
                      </div>
                      {task.dueDate && (
                        <p className="text-sm text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()} {task.dueTime && `at ${task.dueTime}`}
                        </p>
                      )}
                      {contactName && (
                        <p className="text-sm text-muted-foreground">
                          Contact: {contactName}
                        </p>
                      )}
                      {isAdmin && task.agentName && (
                        <p className="text-xs text-muted-foreground">
                          Agent: {task.agentName}
                        </p>
                      )}
                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status === 'active' ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteTask(task.id)}
                          className="flex items-center text-green-600 hover:text-green-700"
                        >
                          <CheckSquare className="h-4 w-4 mr-1" />
                          Complete
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReactivateTask(task.id)}
                          className="flex items-center text-blue-600 hover:text-blue-700"
                        >
                          <RefreshCcw className="h-4 w-4 mr-1" />
                          Reactivate
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTask(task.id)}
                      >
                        <ListTodo className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            <ContactsPagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              startIndex={pagination.startIndex}
              endIndex={pagination.endIndex}
              hasNextPage={pagination.hasNextPage}
              hasPreviousPage={pagination.hasPreviousPage}
              onNextPage={pagination.goToNextPage}
              onPreviousPage={pagination.goToPreviousPage}
            />
          </div>
        ) : (
          <EmptyState
            icon={<ListTodo size={40} />}
            title="No tasks found"
            description="Try changing your search filters or create a new task"
            actionText="Create Task"
            actionLink="/tasks/new"
          />
        )}
      </div>
    </>
  );
};

export default Tasks;
