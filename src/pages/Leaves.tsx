
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm';
import { LeaveStatistics } from '@/components/leaves/LeaveStatistics';
import { LeaveTableView } from '@/components/leaves/LeaveTableView';
import { LeaveMobileView } from '@/components/leaves/LeaveMobileView';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, User, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      {/* Header Section with prominent Apply Leave button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground mt-1">
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
        
        {/* Prominent Apply for Leave Section */}
        <div className="flex flex-col items-end gap-3 w-full sm:w-auto">
          {/* Apply for Leave Button - Always visible */}
          <div className="w-full sm:w-auto">
            <LeaveRequestForm currentUserTeamMember={currentUserTeamMember} />
          </div>
          
          {/* Status Messages */}
          {!currentUserTeamMember && !loading && (
            <Alert className="w-full sm:max-w-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                Unable to load your profile. The Apply for Leave button may not work properly.
              </AlertDescription>
            </Alert>
          )}
          
          {currentUserTeamMember && (
            <div className="text-xs text-muted-foreground text-center sm:text-right">
              Profile: {currentUserTeamMember.first_name} {currentUserTeamMember.last_name}
            </div>
          )}
        </div>
      </div>

      {/* Alternative Apply Button if form is hidden */}
      <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed border-muted-foreground/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">Need to Apply for Leave?</h3>
            <p className="text-muted-foreground text-sm">Click the button to submit a new leave request</p>
          </div>
          <LeaveRequestForm currentUserTeamMember={currentUserTeamMember} />
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
