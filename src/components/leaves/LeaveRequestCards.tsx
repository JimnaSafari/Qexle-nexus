
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import LeaveRequestActions from './LeaveRequestActions';
import type { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  team_member: {
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
};

interface LeaveRequestCardsProps {
  leaveRequests: LeaveRequest[];
  isSeniorAssociate: boolean;
  onActionComplete: () => void;
}

const LeaveRequestCards = ({ leaveRequests, isSeniorAssociate, onActionComplete }: LeaveRequestCardsProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'mna-success';
      case 'pending': return 'mna-warning';
      case 'rejected': return 'mna-danger';
      default: return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:hidden">
      {leaveRequests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">
                {request.team_member?.first_name} {request.team_member?.last_name}
              </CardTitle>
              <Badge 
                variant="outline" 
                className={`border-${getStatusColor(request.status || 'pending')} text-${getStatusColor(request.status || 'pending')}`}
              >
                {request.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Department:</span>
              <span className="text-sm font-medium">{request.team_member?.department}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Start Date:</span>
              <span className="text-sm font-medium">{new Date(request.start_date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">End Date:</span>
              <span className="text-sm font-medium">{new Date(request.end_date).toLocaleDateString()}</span>
            </div>
            <div className="pt-2">
              <span className="text-sm text-muted-foreground">Reason:</span>
              <p className="text-sm mt-1">{request.reason}</p>
            </div>
            <div className="flex space-x-2 pt-2">
              <LeaveRequestActions 
                request={request} 
                isSeniorAssociate={isSeniorAssociate}
                onActionComplete={onActionComplete}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeaveRequestCards;
