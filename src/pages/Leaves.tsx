
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Check, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { generateLeaveRequestPDF } from '@/utils/pdfGenerator';
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    team_member_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

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

    setFormLoading(true);
    try {
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          team_member_id: formData.team_member_id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason,
          status: 'pending'
        });

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
    } finally {
      setFormLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    if (!isSeniorAssociate) {
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
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

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

  const handleReject = async (requestId: string) => {
    if (!isSeniorAssociate) {
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
          approved_at: new Date().toISOString()
        })
        .eq('id', requestId);

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

  const handleDownloadPDF = (request: LeaveRequest) => {
    generateLeaveRequestPDF(request);
    toast({
      title: "Download Started",
      description: "Leave request document is being downloaded",
    });
  };

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
                        {member.first_name} {member.last_name} - {member.role}
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
                <Button onClick={handleAddRequest} disabled={formLoading} className="flex-1">
                  {formLoading ? 'Submitting...' : 'Submit Request'}
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table View */}
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
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadPDF(request)}
                        >
                          <Download size={16} className="mr-1" />
                          PDF
                        </Button>
                        {request.status === 'pending' && isSeniorAssociate && (
                          <>
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
                          </>
                        )}
                      </div>
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

      {/* Card View for Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:hidden">
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
                <span className="text-sm text-muted-foreground">Department:</span>
                <span className="text-sm font-medium">{request.team_member?.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <span className="text-sm font-medium">{new Date(request.start_date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">End Date:</span>
                <span className="text-sm font-medium">{new Date(request.end_date).toLocaleDateString()}</span>
              </div>
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => handleDownloadPDF(request)}
                >
                  <Download size={16} className="mr-1" />
                  PDF
                </Button>
                {request.status === 'pending' && isSeniorAssociate && (
                  <>
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
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Leaves;
