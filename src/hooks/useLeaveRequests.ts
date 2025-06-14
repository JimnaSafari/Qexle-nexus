
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  team_member: {
    first_name: string;
    last_name: string;
    email: string;
  };
  approved_by_member?: {
    first_name: string;
    last_name: string;
  };
};

type TeamMember = Database['public']['Tables']['team_members']['Row'];

export const useLeaveRequests = () => {
  const { toast } = useToast();
  const { user, isSeniorAssociate } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [currentUserTeamMember, setCurrentUserTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch current user's team member record
  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('team_members')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching current user:', error);
          return;
        }
        
        setCurrentUserTeamMember(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchCurrentUser();
  }, [user]);

  // Fetch leave requests with corrected relationship names
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          team_member:team_members!leave_requests_team_member_id_fkey (
            first_name,
            last_name,
            email
          ),
          approved_by_member:team_members!leave_requests_approved_by_fkey (
            first_name,
            last_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching leave requests:', error);
        toast({
          title: "Error",
          description: "Failed to load leave requests",
          variant: "destructive",
        });
        return;
      }

      setLeaveRequests(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load leave requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    fetchLeaveRequests();

    const channel = supabase
      .channel('leave-requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leave_requests'
        },
        (payload) => {
          console.log('Real-time update:', payload);
          fetchLeaveRequests(); // Refetch to get complete data with joins
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id: string) => {
    if (!isSeniorAssociate || !currentUserTeamMember) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can approve leave requests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'approved',
          approved_by: currentUserTeamMember.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error approving leave request:', error);
        toast({
          title: "Error",
          description: "Failed to approve leave request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Leave request approved",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!isSeniorAssociate || !currentUserTeamMember) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can reject leave requests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({
          status: 'rejected',
          approved_by: currentUserTeamMember.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error rejecting leave request:', error);
        toast({
          title: "Error",
          description: "Failed to reject leave request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Leave request rejected",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    }
  };

  return {
    leaveRequests,
    currentUserTeamMember,
    loading,
    handleApprove,
    handleReject,
    fetchLeaveRequests
  };
};

export type { LeaveRequest, TeamMember };
