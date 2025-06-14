
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

interface LeaveRequestTableProps {
  leaveRequests: LeaveRequest[];
  loading: boolean;
  isSeniorAssociate: boolean;
  onActionComplete: () => void;
}

const LeaveRequestTable = ({ leaveRequests, loading, isSeniorAssociate, onActionComplete }: LeaveRequestTableProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'mna-success';
      case 'pending': return 'mna-warning';
      case 'rejected': return 'mna-danger';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Requests Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-4">Loading leave requests...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaveRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    <div>
                      <div>{request.team_member?.first_name} {request.team_member?.last_name}</div>
                      <div className="text-sm text-muted-foreground">{request.team_member?.department}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {new Date(request.start_date).toLocaleDateString()}</div>
                      <div>To: {new Date(request.end_date).toLocaleDateString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={request.reason}>
                      {request.reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`border-${getStatusColor(request.status || 'pending')} text-${getStatusColor(request.status || 'pending')}`}
                    >
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <LeaveRequestActions 
                      request={request} 
                      isSeniorAssociate={isSeniorAssociate}
                      onActionComplete={onActionComplete}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {leaveRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No leave requests found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveRequestTable;
