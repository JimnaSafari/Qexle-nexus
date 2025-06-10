
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Tasks = () => {
  const [tasks] = useState([
    { 
      id: 1, 
      title: 'Review Johnson vs. Smith Contract', 
      priority: 'High', 
      status: 'In Progress',
      assignee: 'Sarah Johnson',
      deadline: '2024-06-15'
    },
    { 
      id: 2, 
      title: 'Prepare Court Filing for Peterson Case', 
      priority: 'Medium', 
      status: 'Pending',
      assignee: 'Michael Brown',
      deadline: '2024-06-18'
    },
    { 
      id: 3, 
      title: 'Client Meeting - Estate Planning', 
      priority: 'Low', 
      status: 'Completed',
      assignee: 'Emily Davis',
      deadline: '2024-06-12'
    },
    { 
      id: 4, 
      title: 'Legal Research - Patent Law', 
      priority: 'High', 
      status: 'In Progress',
      assignee: 'David Wilson',
      deadline: '2024-06-20'
    },
  ]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Task Management</h1>
          <p className="text-muted-foreground">Manage and track all legal tasks</p>
        </div>
        <Button className="bg-mna-navy hover:bg-mna-navy/90">
          <Plus size={16} className="mr-2" />
          New Task
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <Badge variant={getPriorityColor(task.priority) as any}>
                  {task.priority}
                </Badge>
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Tasks;
