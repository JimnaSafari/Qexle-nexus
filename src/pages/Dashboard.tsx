
import { Calendar, File, List, Clock } from 'lucide-react';
import MetricCard from '@/components/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const recentTasks = [
    { id: 1, title: 'Review Johnson vs. Smith Contract', priority: 'High', status: 'In Progress' },
    { id: 2, title: 'Prepare Court Filing for Peterson Case', priority: 'Medium', status: 'Pending' },
    { id: 3, title: 'Client Meeting - Estate Planning', priority: 'Low', status: 'Completed' },
  ];

  const upcomingEvents = [
    { id: 1, title: 'Court Hearing - Case #2024-001', time: '10:00 AM', date: 'Today' },
    { id: 2, title: 'Client Consultation', time: '2:00 PM', date: 'Tomorrow' },
    { id: 3, title: 'Team Meeting', time: '9:00 AM', date: 'Wednesday' },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Welcome to MNA Law Firm Management System</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <MetricCard
          title="Active Tasks"
          value={24}
          icon={List}
          change="+2 from yesterday"
          changeType="positive"
        />
        <MetricCard
          title="Court Files"
          value={18}
          icon={File}
          change="+1 new filing"
          changeType="positive"
        />
        <MetricCard
          title="Upcoming Events"
          value={7}
          icon={Calendar}
          change="3 this week"
          changeType="neutral"
        />
        <MetricCard
          title="Pending Leaves"
          value={3}
          icon={Clock}
          change="2 awaiting approval"
          changeType="neutral"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        <Card className="animate-scale-in">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate pr-2">{task.title}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      variant={task.priority === 'High' ? 'destructive' : task.priority === 'Medium' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {task.priority}
                    </Badge>
                    <Badge variant="outline" className="text-xs">{task.status}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="animate-scale-in">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 sm:p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors space-y-1 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate pr-2">{event.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{event.time} - {event.date}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
