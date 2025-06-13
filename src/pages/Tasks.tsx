
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
  assignee: string;
  deadline: string;
  description?: string;
}

const Tasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: 1, 
      title: 'Review Johnson vs. Smith Contract', 
      priority: 'High', 
      status: 'In Progress',
      assignee: 'Sarah Johnson',
      deadline: '2024-06-15',
      description: 'Review and analyze contract terms for potential disputes'
    },
    { 
      id: 2, 
      title: 'Prepare Court Filing for Peterson Case', 
      priority: 'Medium', 
      status: 'Pending',
      assignee: 'Michael Brown',
      deadline: '2024-06-18',
      description: 'Prepare all necessary documentation for court submission'
    },
    { 
      id: 3, 
      title: 'Client Meeting - Estate Planning', 
      priority: 'Low', 
      status: 'Completed',
      assignee: 'Emily Davis',
      deadline: '2024-06-12',
      description: 'Consultation meeting with client regarding estate planning options'
    },
    { 
      id: 4, 
      title: 'Legal Research - Patent Law', 
      priority: 'High', 
      status: 'In Progress',
      assignee: 'David Wilson',
      deadline: '2024-06-20',
      description: 'Research current patent law regulations and precedents'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    priority: '',
    status: '',
    assignee: '',
    deadline: '',
    description: ''
  });

  const priorities = ['High', 'Medium', 'Low'];
  const statuses = ['Pending', 'In Progress', 'Completed'];
  const assignees = ['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'destructive';
      case 'Medium': return 'default';
      case 'Low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'mna-success';
      case 'In Progress': return 'mna-warning';
      case 'Pending': return 'mna-grey';
      default: return 'outline';
    }
  };

  const handleAddTask = () => {
    if (!formData.title || !formData.priority || !formData.status || !formData.assignee || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const newTask: Task = {
      id: Date.now(),
      ...formData
    };

    setTasks([...tasks, newTask]);
    setFormData({ title: '', priority: '', status: '', assignee: '', deadline: '', description: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Task created successfully",
    });
  };

  const handleEditTask = () => {
    if (!editingTask || !formData.title || !formData.priority || !formData.status || !formData.assignee || !formData.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setTasks(tasks.map(task => 
      task.id === editingTask.id 
        ? { ...task, ...formData }
        : task
    ));
    setEditingTask(null);
    setFormData({ title: '', priority: '', status: '', assignee: '', deadline: '', description: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Task updated successfully",
    });
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
    toast({
      title: "Success",
      description: "Task deleted successfully",
    });
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      priority: task.priority,
      status: task.status,
      assignee: task.assignee,
      deadline: task.deadline,
      description: task.description || ''
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingTask(null);
    setFormData({ title: '', priority: '', status: '', assignee: '', deadline: '', description: '' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Manage and track all legal tasks</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-mna-navy hover:bg-mna-navy/90">
              <Plus size={16} className="mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter task title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority} value={priority}>{priority}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={formData.assignee} onValueChange={(value) => setFormData({...formData, assignee: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignees.map((assignee) => (
                      <SelectItem key={assignee} value={assignee}>{assignee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Enter task description"
                  className="h-20"
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingTask ? handleEditTask : handleAddTask}
                  className="flex-1"
                >
                  {editingTask ? 'Update' : 'Create'} Task
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <div className="flex items-center space-x-1">
                  <Badge variant={getPriorityColor(task.priority) as any}>
                    {task.priority}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(task)}
                  >
                    <Edit size={12} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-mna-danger hover:text-mna-danger"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge 
                  variant="outline" 
                  className={`border-${getStatusColor(task.status)} text-${getStatusColor(task.status)}`}
                >
                  {task.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Assignee:</span>
                <span className="text-sm font-medium">{task.assignee}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deadline:</span>
                <span className="text-sm font-medium">{task.deadline}</span>
              </div>
              {task.description && (
                <div className="pt-2">
                  <span className="text-sm text-muted-foreground">Description:</span>
                  <p className="text-sm mt-1">{task.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
