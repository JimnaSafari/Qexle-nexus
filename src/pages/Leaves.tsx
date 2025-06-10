
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Leaves = () => {
  const leaveRequests = [
    { 
      id: 1, 
      employee: 'Sarah Johnson', 
      type: 'Annual Leave', 
      startDate: '2024-06-20',
      endDate: '2024-06-25',
      status: 'Approved',
      reason: 'Family vacation'
    },
    { 
      id: 2, 
      employee: 'Michael Brown', 
      type: 'Sick Leave', 
      startDate: '2024-06-15',
      endDate: '2024-06-16',
      status: 'Pending',
      reason: 'Medical appointment'
    },
    { 
      id: 3, 
      employee: 'Emily Davis', 
      type: 'Personal Leave', 
      startDate: '2024-06-30',
      endDate: '2024-07-02',
      status: 'Pending',
      reason: 'Personal matters'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'mna-success';
      case 'Pending': return 'mna-warning';
      case 'Rejected': return 'mna-danger';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground">Manage employee leave requests and approvals</p>
        </div>
        <Button className="bg-mna-navy hover:bg-mna-navy/90">
          <Plus size={16} className="mr-2" />
          New Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {leaveRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{request.employee}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`border-${getStatusColor(request.status)} text-${getStatusColor(request.status)}`}
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">{request.type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <span className="text-sm font-medium">{request.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">End Date:</span>
                <span className="text-sm font-medium">{request.endDate}</span>
              </div>
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
              {request.status === 'Pending' && (
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="bg-mna-success hover:bg-mna-success/90 text-white">
                    Approve
                  </Button>
                  <Button size="sm" variant="outline" className="border-mna-danger text-mna-danger hover:bg-mna-danger hover:text-white">
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leaves;
