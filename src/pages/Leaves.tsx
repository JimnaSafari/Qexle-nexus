
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import LeaveRequestForm from '@/components/leaves/LeaveRequestForm';
import LeaveRequestTable from '@/components/leaves/LeaveRequestTable';
import LeaveRequestCards from '@/components/leaves/LeaveRequestCards';
import type { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  team_member: {
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
  approved_by_member?: {
    first_name: string;
    last_name: string;
  };
};

type TeamMember = Database['public']['Tables']['team_members']['Row'];

const Leaves = () => {
  const { toast } = useToast();
  const { isSeniorAssociate } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch team members
  const fetchTeamMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('first_name');

      if (error) throw error;
      setTeamMembers(data || []);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      });
    }
  };

  // Fetch leave requests with team member details
  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          team_member:team_members!leave_requests_team_member_id_fkey(
            first_name,
            last_name,
            email,
            department
          ),
          approved_by_member:team_members!leave_requests_approved_by_fkey(
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
    fetchLeaveRequests();

    // Set up real-time subscription
    const channel = supabase
      .channel('leave-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests'
        },
        () => {
          fetchLeaveRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground">Manage employee leave requests and approvals</p>
        </div>
        <LeaveRequestForm 
          teamMembers={teamMembers} 
          onRequestCreated={fetchLeaveRequests}
        />
      </div>

      {/* Table View */}
      <LeaveRequestTable 
        leaveRequests={leaveRequests}
        loading={loading}
        isSeniorAssociate={isSeniorAssociate}
        onActionComplete={fetchLeaveRequests}
      />

      {/* Card View for Mobile */}
      <LeaveRequestCards 
        leaveRequests={leaveRequests}
        isSeniorAssociate={isSeniorAssociate}
        onActionComplete={fetchLeaveRequests}
      />
    </div>
  );
};

export default Leaves;
