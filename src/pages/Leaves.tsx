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
import { Plus, Check, X, Download, Calendar, User } from 'lucide-react';
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

const Leaves = () => {
  const { toast } = useToast();
  const { user, isSeniorAssociate } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [currentUserTeamMember, setCurrentUserTeamMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleSubmitRequest = async () => {
    if (!currentUserTeamMember) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_date || !formData.end_date || !formData.reason.trim()) {
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
      setSubmitting(true);
      const { error } = await supabase
        .from('leave_requests')
        .insert({
          team_member_id: currentUserTeamMember.id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason.trim(),
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting leave request:', error);
        toast({
          title: "Error",
          description: "Failed to submit leave request",
          variant: "destructive",
        });
        return;
      }

      setFormData({ start_date: '', end_date: '', reason: '' });
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

  // Generate PDF for leave request
  const generatePDF = (request: LeaveRequest) => {
    const doc = `
LEAVE REQUEST REPORT
===================

Employee: ${request.team_member?.first_name} ${request.team_member?.last_name}
Email: ${request.team_member?.email}
Start Date: ${request.start_date}
End Date: ${request.end_date}
Status: ${request.status?.toUpperCase()}

Reason:
${request.reason}

${request.status === 'approved' || request.status === 'rejected' ? `
Decision by: ${request.approved_by_member?.first_name} ${request.approved_by_member?.last_name}
Decision date: ${request.approved_at ? new Date(request.approved_at).toLocaleDateString() : 'N/A'}
` : ''}

Generated on: ${new Date().toLocaleDateString()}

MNA Africa Law Firm
Leave Management System
    `;

    const blob = new Blob([doc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-request-${request.team_member?.first_name}-${request.team_member?.last_name}-${request.start_date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Leave request document is being downloaded",
    });
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

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
        
        {currentUserTeamMember && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-mna-navy hover:bg-mna-navy/90">
                <Plus size={16} className="mr-2" />
                Apply for Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                  <User size={16} className="text-muted-foreground" />
                  <span className="font-medium">
                    {currentUserTeamMember.first_name} {currentUserTeamMember.last_name}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                      min={formData.start_date || new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                
                {formData.start_date && formData.end_date && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    <span>Duration: {calculateDays(formData.start_date, formData.end_date)} day(s)</span>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="reason">Reason for Leave</Label>
                  <Textarea
                    id="reason"
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    placeholder="Please provide a detailed reason for your leave request..."
                    className="h-24"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleSubmitRequest} 
                    className="flex-1"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Statistics Cards */}
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

      {/* Desktop Table View */}
      <Card className="hidden lg:block">
        <CardHeader>
          <CardTitle>Leave Requests Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {leaveRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No leave requests found</p>
            </div>
          ) : (
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
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Check size={16} className="mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleReject(request.id)}
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
          )}
        </CardContent>
      </Card>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 lg:hidden">
        {leaveRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No leave requests found</p>
            </CardContent>
          </Card>
        ) : (
          leaveRequests.map((request) => (
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
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <Check size={16} className="mr-1" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleReject(request.id)}
                      className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex-1"
                    >
                      <X size={16} className="mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Leaves;
