
import { useAuth } from '@/contexts/AuthContext';
import { useLeaveRequests } from '@/hooks/useLeaveRequests';
import { LeaveRequestForm } from '@/components/leaves/LeaveRequestForm';
import { LeaveStatistics } from '@/components/leaves/LeaveStatistics';
import { LeaveTableView } from '@/components/leaves/LeaveTableView';
import { LeaveMobileView } from '@/components/leaves/LeaveMobileView';

const Leaves = () => {
  const { isSeniorAssociate } = useAuth();
  const { 
    leaveRequests, 
    currentUserTeamMember, 
    loading, 
    handleApprove, 
    handleReject 
  } = useLeaveRequests();

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
        </div>
        
        <LeaveRequestForm currentUserTeamMember={currentUserTeamMember} />
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
