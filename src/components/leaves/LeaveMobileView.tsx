
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Download } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { calculateDays, getStatusColor, generatePDF } from '@/utils/leaveUtils';
import type { LeaveRequest } from '@/hooks/useLeaveRequests';

interface LeaveMobileViewProps {
  leaveRequests: LeaveRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const LeaveMobileView = ({ leaveRequests, onApprove, onReject }: LeaveMobileViewProps) => {
  const { isSeniorAssociate } = useAuth();

  if (leaveRequests.length === 0) {
    return (
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No leave requests found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:hidden">
      {leaveRequests.map((request) => (
        <Card key={request.id} className="hover:shadow-lg transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {request.team_member?.first_name} {request.team_member?.last_name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{request.team_member?.email}</p>
              </div>
              <Badge 
                variant="outline" 
                className={getStatusColor(request.status || 'pending')}
              >
                {request.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <p className="font-medium">{new Date(request.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">End Date:</span>
                <p className="font-medium">{new Date(request.end_date).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Duration:</span>
              <p className="font-medium">{calculateDays(request.start_date, request.end_date)} day(s)</p>
            </div>
            
            <div>
              <span className="text-sm text-muted-foreground">Reason:</span>
              <p className="text-sm mt-1">{request.reason}</p>
            </div>
            
            {(request.status === 'approved' || request.status === 'rejected') && request.approved_by_member && (
              <div>
                <span className="text-sm text-muted-foreground">
                  {request.status === 'approved' ? 'Approved by:' : 'Rejected by:'}
                </span>
                <p className="text-sm font-medium">
                  {request.approved_by_member.first_name} {request.approved_by_member.last_name}
                </p>
                {request.approved_at && (
                  <p className="text-xs text-muted-foreground">
                    on {new Date(request.approved_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}
            
            <div className="flex space-x-2 pt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => generatePDF(request)}
                className="flex-1"
              >
                <Download size={16} className="mr-1" />
                Download PDF
              </Button>
            </div>
            
            {request.status === 'pending' && isSeniorAssociate && (
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => onApprove(request.id)}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <Check size={16} className="mr-1" />
                  Approve
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => onReject(request.id)}
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
                >
                  <X size={16} className="mr-1" />
                  Reject
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
