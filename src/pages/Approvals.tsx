
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Clock } from 'lucide-react';

const Approvals = () => {
  const pendingApprovals = [
    { 
      id: 1, 
      type: 'Leave Request',
      requester: 'Sarah Johnson',
      details: '3 days annual leave - June 15-17, 2024',
      requestDate: '2024-06-10',
      priority: 'Medium'
    },
    { 
      id: 2, 
      type: 'Budget Approval',
      requester: 'Michael Brown',
      details: 'Legal research subscription - KES 5,000/month',
      requestDate: '2024-06-08',
      priority: 'High'
    },
    { 
      id: 3, 
      type: 'Client Contract',
      requester: 'Emily Davis',
      details: 'New retainer agreement - TechCorp Industries',
      requestDate: '2024-06-09',
      priority: 'High'
    },
    { 
      id: 4, 
      type: 'Equipment Request',
      requester: 'David Wilson',
      details: 'New laptop for case management',
      requestDate: '2024-06-11',
      priority: 'Low'
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-mna-danger text-white';
      case 'Medium': return 'bg-mna-accent text-mna-primary';
      case 'Low': return 'bg-mna-secondary text-mna-primary';
      default: return 'bg-mna-secondary text-mna-primary';
    }
  };

  const handleApprove = (approvalId: number) => {
    console.log(`Approving request ${approvalId}`);
    // This would integrate with your backend approval system
  };

  const handleReject = (approvalId: number) => {
    console.log(`Rejecting request ${approvalId}`);
    // This would integrate with your backend approval system
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve pending requests</p>
        </div>
        <Badge variant="outline" className="border-mna-accent text-mna-accent">
          <Clock size={16} className="mr-2" />
          {pendingApprovals.length} Pending
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {pendingApprovals.map((approval) => (
          <Card key={approval.id} className="hover:shadow-lg transition-all duration-200 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{approval.type}</CardTitle>
                <Badge className={getPriorityColor(approval.priority)}>
                  {approval.priority} Priority
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-muted-foreground">Requester:</span>
                  <p className="text-sm font-medium">{approval.requester}</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Request Date:</span>
                  <p className="text-sm font-medium">{approval.requestDate}</p>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Details:</span>
                <p className="text-sm font-medium mt-1">{approval.details}</p>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button 
                  onClick={() => handleApprove(approval.id)}
                  className="flex-1 bg-mna-success hover:bg-mna-success/90"
                >
                  <Check size={16} className="mr-2" />
                  Approve
                </Button>
                <Button 
                  onClick={() => handleReject(approval.id)}
                  variant="outline"
                  className="flex-1 border-mna-danger text-mna-danger hover:bg-mna-danger hover:text-white"
                >
                  <X size={16} className="mr-2" />
                  Reject
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Approvals;
