import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus,
  Calendar,
  User,
  Flag,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  property?: string;
  client?: string;
  tags: string[];
  createdDate: string;
}

const BrokerTasks = () => {
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo' as Task['status'],
    priority: 'medium' as Task['priority'],
    assignee: '',
    dueDate: '',
    property: '',
    client: '',
    tags: ''
  });

  // Mock tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Schedule property inspection',
      description: 'Coordinate with buyer agent for property inspection at Ocean Drive',
      status: 'todo',
      priority: 'high',
      assignee: 'Sarah Johnson',
      dueDate: '2024-01-20',
      property: '123 Ocean Drive, Miami Beach',
      client: 'John Smith',
      tags: ['inspection', 'urgent'],
      createdDate: '2024-01-15'
    },
    {
      id: '2',
      title: 'Prepare listing photos',
      description: 'Schedule professional photography for new listing',
      status: 'in-progress',
      priority: 'medium',
      assignee: 'Mike Rodriguez',
      dueDate: '2024-01-18',
      property: '456 Sunset Boulevard, Tampa',
      client: 'Maria Garcia',
      tags: ['photography', 'listing'],
      createdDate: '2024-01-14'
    },
    {
      id: '3',
      title: 'Review purchase contract',
      description: 'Legal review of purchase agreement terms and conditions',
      status: 'review',
      priority: 'urgent',
      assignee: 'Lisa Chen',
      dueDate: '2024-01-17',
      property: '789 Palm Avenue, Orlando',
      client: 'David Chen',
      tags: ['legal', 'contract'],
      createdDate: '2024-01-13'
    },
    {
      id: '4',
      title: 'Update MLS listing',
      description: 'Update property details and pricing on MLS',
      status: 'done',
      priority: 'low',
      assignee: 'Sarah Johnson',
      dueDate: '2024-01-16',
      property: '321 Beach Road, Fort Lauderdale',
      client: 'Jennifer Wilson',
      tags: ['mls', 'update'],
      createdDate: '2024-01-12'
    },
    {
      id: '5',
      title: 'Follow up with mortgage lender',
      description: 'Check on loan approval status for buyer',
      status: 'todo',
      priority: 'medium',
      assignee: 'Mike Rodriguez',
      dueDate: '2024-01-19',
      client: 'Robert Davis',
      tags: ['financing', 'follow-up'],
      createdDate: '2024-01-15'
    },
    {
      id: '6',
      title: 'Prepare closing documents',
      description: 'Gather all necessary documents for property closing',
      status: 'in-progress',
      priority: 'high',
      assignee: 'Lisa Chen',
      dueDate: '2024-01-22',
      property: '555 Marina Way, Naples',
      client: 'Amanda Thompson',
      tags: ['closing', 'documents'],
      createdDate: '2024-01-14'
    }
  ]);

  const resetTaskForm = () => {
    setTaskForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
      property: '',
      client: '',
      tags: ''
    });
  };

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.assignee || !taskForm.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTask: Task = {
      id: Date.now().toString(),
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      assignee: taskForm.assignee,
      dueDate: taskForm.dueDate,
      property: taskForm.property,
      client: taskForm.client,
      tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      createdDate: new Date().toISOString().split('T')[0]
    };

    setTasks(prev => [...prev, newTask]);
    setShowTaskDialog(false);
    resetTaskForm();
    toast.success('Task created successfully!');
  };

  const handleUpdateTask = () => {
    if (!editingTask) return;

    const updatedTask: Task = {
      ...editingTask,
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      assignee: taskForm.assignee,
      dueDate: taskForm.dueDate,
      property: taskForm.property,
      client: taskForm.client,
      tags: taskForm.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    setTasks(prev => prev.map(task => task.id === editingTask.id ? updatedTask : task));
    setEditingTask(null);
    setShowTaskDialog(false);
    resetTaskForm();
    toast.success('Task updated successfully!');
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      dueDate: task.dueDate,
      property: task.property || '',
      client: task.client || '',
      tags: task.tags.join(', ')
    });
    setShowTaskDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
    toast.success('Task deleted successfully!');
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    toast.success('Task status updated!');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="w-4 h-4" />;
      case 'in-progress': return <AlertCircle className="w-4 h-4" />;
      case 'review': return <Flag className="w-4 h-4" />;
      case 'done': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const columns = [
    { id: 'todo', title: 'To Do', status: 'todo' as Task['status'] },
    { id: 'in-progress', title: 'In Progress', status: 'in-progress' as Task['status'] },
    { id: 'review', title: 'Review', status: 'review' as Task['status'] },
    { id: 'done', title: 'Done', status: 'done' as Task['status'] }
  ];

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-sm">{task.title}</h4>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => handleEditTask(task)}
              >
                <Edit className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-2">
            <Badge className={getPriorityColor(task.priority)} variant="outline">
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>

          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="space-y-1 text-xs text-gray-500">
            {task.client && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {task.client}
              </div>
            )}
            {task.property && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {task.property}
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          </div>

          <div className="text-xs text-gray-500">
            Assigned to: <span className="font-medium">{task.assignee}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const TaskDialog = () => (
    <Dialog open={showTaskDialog} onOpenChange={(open) => {
      if (!open) {
        setShowTaskDialog(false);
        setEditingTask(null);
        resetTaskForm();
      }
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
          <DialogDescription>
            {editingTask ? 'Update task details' : 'Add a new task to your workflow'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={taskForm.title}
              onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={taskForm.description}
              onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the task..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={taskForm.status} onValueChange={(value: Task['status']) => setTaskForm(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={taskForm.priority} onValueChange={(value: Task['priority']) => setTaskForm(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee *</Label>
              <Select value={taskForm.assignee} onValueChange={(value) => setTaskForm(prev => ({ ...prev, assignee: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike Rodriguez">Mike Rodriguez</SelectItem>
                  <SelectItem value="Lisa Chen">Lisa Chen</SelectItem>
                  <SelectItem value="David Wilson">David Wilson</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="property">Related Property</Label>
            <Input
              id="property"
              value={taskForm.property}
              onChange={(e) => setTaskForm(prev => ({ ...prev, property: e.target.value }))}
              placeholder="Property address (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client">Client</Label>
            <Input
              id="client"
              value={taskForm.client}
              onChange={(e) => setTaskForm(prev => ({ ...prev, client: e.target.value }))}
              placeholder="Client name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              value={taskForm.tags}
              onChange={(e) => setTaskForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
            Cancel
          </Button>
          <Button onClick={editingTask ? handleUpdateTask : handleCreateTask}>
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Task Management</h1>
          <p className="text-gray-600">
            Organize and track your real estate workflow
          </p>
        </div>
        <Button onClick={() => setShowTaskDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((column) => {
          const count = tasks.filter(task => task.status === column.status).length;
          return (
            <Card key={column.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{column.title}</CardTitle>
                {getStatusIcon(column.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
                <p className="text-xs text-muted-foreground">
                  {count === 1 ? 'task' : 'tasks'}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {getStatusIcon(column.status)}
                {column.title}
              </h3>
              <Badge variant="secondary">
                {tasks.filter(task => task.status === column.status).length}
              </Badge>
            </div>
            
            <div className="min-h-[400px] bg-gray-50 rounded-lg p-3">
              {tasks
                .filter(task => task.status === column.status)
                .map(task => (
                  <TaskCard key={task.id} task={task} />
                ))}
              
              {tasks.filter(task => task.status === column.status).length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No tasks in {column.title.toLowerCase()}</div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <TaskDialog />
    </div>
  );
};

export default BrokerTasks;