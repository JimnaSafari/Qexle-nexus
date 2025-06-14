
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm';
import { LeaveStatistics } from '@/components/leaves/LeaveStatistics';
import { LeaveTableView } from '@/components/leaves/LeaveTableView';
import { LeaveMobileView } from '@/components/leaves/LeaveMobileView';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User } from 'lucide-react';

const Leaves = () => {
  const { isSeniorAssociate, user, isAuthenticated } = useAuth();
  const { 
    leaveRequests, 
    currentUserTeamMember, 
    loading, 
    handleApprove, 
    handleReject 
  } = useLeaveRequests();

  console.log('Leaves page debug:', {
    isAuthenticated,
    user: user ? { id: user.id, name: user.name, role: user.role } : null,
    currentUserTeamMember,
    isSeniorAssociate,
    loading
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mna-navy mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading leave requests...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          You need to be logged in to access leave requests.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground">
            {isSeniorAssociate 
              ? "Manage and approve employee leave requests" 
              : "View your leave requests and submit new applications"
            }
          </p>
          {user && (
            <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
              <User size={16} />
              Logged in as: {user.name} ({user.role})
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end gap-2">
          {!currentUserTeamMember && !loading && (
            <Alert className="max-w-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Unable to load your profile. The Apply for Leave button may not work properly.
              </AlertDescription>
            </Alert>
          )}
          
          <LeaveRequestForm currentUserTeamMember={currentUserTeamMember} />
          
          {currentUserTeamMember && (
            <div className="text-xs text-muted-foreground">
              Profile: {currentUserTeamMember.first_name} {currentUserTeamMember.last_name}
            </div>
          )}
        </div>
      </div>

      <LeaveStatistics leaveRequests={leaveRequests} />

      <LeaveTableView 
        leaveRequests={leaveRequests}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <LeaveMobileView 
        leaveRequests={leaveRequests}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};

export default Leaves;
