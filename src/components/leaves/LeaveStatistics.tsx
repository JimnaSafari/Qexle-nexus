
import { Card, CardContent } from '@/components/ui/card';
import type { LeaveRequest } from '@/hooks/useLeaveRequests';

interface LeaveStatisticsProps {
  leaveRequests: LeaveRequest[];
}

export const LeaveStatistics = ({ leaveRequests }: LeaveStatisticsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-mna-navy">
            {leaveRequests.filter(r => r.status === 'pending').length}
          </div>
          <p className="text-sm text-muted-foreground">Pending Requests</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-green-600">
            {leaveRequests.filter(r => r.status === 'approved').length}
          </div>
          <p className="text-sm text-muted-foreground">Approved</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-red-600">
            {leaveRequests.filter(r => r.status === 'rejected').length}
          </div>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-2xl font-bold text-mna-navy">
            {leaveRequests.length}
          </div>
          <p className="text-sm text-muted-foreground">Total Requests</p>
        </CardContent>
      </Card>
    </div>
  );
};
