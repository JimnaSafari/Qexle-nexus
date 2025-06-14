
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Check, X, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateDays, getStatusColor, generatePDF } from '@/utils/leaveUtils';
import type { LeaveRequest } from '@/hooks/useLeaveRequests';

interface LeaveTableViewProps {
  leaveRequests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const LeaveTableView = ({ leaveRequests, onApprove, onReject }: LeaveTableViewProps) => {
  const { isSeniorAssociate } = useAuth();

  if (leaveRequests.length === 0) {
    return (
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Leave Requests Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No leave requests found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hidden lg:block">
      <CardHeader>
        <CardTitle>Leave Requests Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Duration</TableHead>
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
                    <div className="text-sm text-muted-foreground">{request.team_member?.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>From: {new Date(request.start_date).toLocaleDateString()}</div>
                    <div>To: {new Date(request.end_date).toLocaleDateString()}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {calculateDays(request.start_date, request.end_date)} day(s)
                  </span>
                </TableCell>
                <TableCell>
                  <div className="max-w-xs truncate" title={request.reason}>
                    {request.reason}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={getStatusColor(request.status || 'pending')}
                  >
                    {request.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => generatePDF(request)}
                    >
                      <Download size={16} className="mr-1" />
                      PDF
                    </Button>
                    {request.status === 'pending' && isSeniorAssociate && (
                      <>
                        <Button 
                          size="sm" 
                          onClick={() => onApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Check size={16} className="mr-1" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => onReject(request.id)}
                          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                        >
                          <X size={16} className="mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
