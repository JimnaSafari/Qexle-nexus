
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  team_member: {
    first_name: string;
    last_name: string;
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
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    team_member_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Emergency Leave'];

  useEffect(() => {
    fetchLeaveRequests();
    fetchTeamMembers();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select(`
          *,
          team_member:team_members!team_member_id(first_name, last_name),
          approved_by_member:team_members!approved_by(first_name, last_name)
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
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'mna-success';
      case 'pending': return 'mna-warning';
      case 'rejected': return 'mna-danger';
      default: return 'outline';
    }
  };

  const handleAddRequest = async () => {
    if (!formData.team_member_id || !formData.start_date || !formData.end_date || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert([{
          team_member_id: formData.team_member_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason
        }]);

      if (error) throw error;

      setFormData({ team_member_id: '', start_date: '', end_date: '', reason: '' });
      setIsDialogOpen(false);
      fetchLeaveRequests();
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    } catch (error) {
      console.error('Error creating leave request:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    }
  };

  const handleApprove = async (id: string) => {
    if (!isSeniorAssociate) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can approve leave requests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: currentUser } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'approved',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      fetchLeaveRequests();
      toast({
        title: "Success",
        description: "Leave request approved",
      });
    } catch (error) {
      console.error('Error approving leave request:', error);
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async (id: string) => {
    if (!isSeniorAssociate) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can reject leave requests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: currentUser } = await supabase
        .from('team_members')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'rejected',
          approved_by: currentUser?.id,
          approved_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      fetchLeaveRequests();
      toast({
        title: "Success",
        description: "Leave request rejected",
      });
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Leave Requests</h1>
          <p className="text-muted-foreground">Manage employee leave requests and approvals</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-mna-navy hover:bg-mna-navy/90">
              <Plus size={16} className="mr-2" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Leave Request</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="team_member_id">Employee</Label>
                <Select value={formData.team_member_id} onValueChange={(value) => setFormData({...formData, team_member_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.first_name} {member.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Enter reason for leave"
                  className="h-20"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleAddRequest} className="flex-1">
                  Submit Request
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <span className="text-sm font-medium">{request.start_date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">End Date:</span>
                <span className="text-sm font-medium">{request.end_date}</span>
              </div>
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
              {request.status === 'pending' && isSeniorAssociate && (
                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleApprove(request.id)}
                    className="bg-mna-success hover:bg-mna-success/90 text-white"
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleReject(request.id)}
                    className="border-mna-danger text-mna-danger hover:bg-mna-danger hover:text-white"
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
    </div>
  );
};

export default Leaves;
