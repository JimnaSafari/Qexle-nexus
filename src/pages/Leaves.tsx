
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

// Mock data for demonstration
const mockLeaveRequests: LeaveRequest[] = [
  {
    id: '1',
    team_member_id: '1',
    start_date: '2024-06-20',
    end_date: '2024-06-25',
    reason: 'Annual vacation to visit family in Nairobi. Need time to spend with relatives during the holiday season.',
    status: 'pending',
    approved_by: null,
    approved_at: null,
    created_at: '2024-06-14T10:30:00Z',
    updated_at: '2024-06-14T10:30:00Z',
    team_member: {
      first_name: 'John',
      last_name: 'Kamau'
    }
  },
  {
    id: '2',
    team_member_id: '2',
    start_date: '2024-06-18',
    end_date: '2024-06-20',
    reason: 'Medical appointment and recovery time for routine surgery.',
    status: 'approved',
    approved_by: '3',
    approved_at: '2024-06-15T09:15:00Z',
    created_at: '2024-06-13T14:20:00Z',
    updated_at: '2024-06-15T09:15:00Z',
    team_member: {
      first_name: 'Mary',
      last_name: 'Wanjiku'
    },
    approved_by_member: {
      first_name: 'David',
      last_name: 'Ochieng'
    }
  },
  {
    id: '3',
    team_member_id: '4',
    start_date: '2024-06-22',
    end_date: '2024-06-24',
    reason: 'Personal emergency - family matters requiring immediate attention.',
    status: 'rejected',
    approved_by: '3',
    approved_at: '2024-06-14T16:45:00Z',
    created_at: '2024-06-12T11:10:00Z',
    updated_at: '2024-06-14T16:45:00Z',
    team_member: {
      first_name: 'Sarah',
      last_name: 'Muthoni'
    },
    approved_by_member: {
      first_name: 'David',
      last_name: 'Ochieng'
    }
  },
  {
    id: '4',
    team_member_id: '5',
    start_date: '2024-07-01',
    end_date: '2024-07-10',
    reason: 'Maternity leave extension for bonding with newborn baby.',
    status: 'approved',
    approved_by: '3',
    approved_at: '2024-06-13T08:30:00Z',
    created_at: '2024-06-10T13:25:00Z',
    updated_at: '2024-06-13T08:30:00Z',
    team_member: {
      first_name: 'Grace',
      last_name: 'Akinyi'
    },
    approved_by_member: {
      first_name: 'David',
      last_name: 'Ochieng'
    }
  },
  {
    id: '5',
    team_member_id: '6',
    start_date: '2024-06-28',
    end_date: '2024-06-30',
    reason: 'Sick leave due to flu symptoms and doctor recommendation for rest.',
    status: 'pending',
    approved_by: null,
    approved_at: null,
    created_at: '2024-06-14T12:00:00Z',
    updated_at: '2024-06-14T12:00:00Z',
    team_member: {
      first_name: 'Peter',
      last_name: 'Kimani'
    }
  }
];

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    user_id: '1',
    email: 'john.kamau@mna.co.ke',
    first_name: 'John',
    last_name: 'Kamau',
    role: 'Junior Associate',
    department: 'Legal',
    phone: '+254701234567',
    avatar_url: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_login: null
  },
  {
    id: '2',
    user_id: '2',
    email: 'mary.wanjiku@mna.co.ke',
    first_name: 'Mary',
    last_name: 'Wanjiku',
    role: 'Legal Counsel',
    department: 'Legal',
    phone: '+254701234568',
    avatar_url: null,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    last_login: null
  }
];

const Leaves = () => {
  const { toast } = useToast();
  const { isSeniorAssociate } = useAuth();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(mockLeaveRequests);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(mockTeamMembers);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    team_member_id: '',
    start_date: '',
    end_date: '',
    reason: ''
  });

  // Generate PDF for leave request
  const generatePDF = (request: LeaveRequest) => {
    const doc = `
      LEAVE REQUEST REPORT
      ===================
      
      Employee: ${request.team_member?.first_name} ${request.team_member?.last_name}
      Start Date: ${request.start_date}
      End Date: ${request.end_date}
      Status: ${request.status?.toUpperCase()}
      
      Reason:
      ${request.reason}
      
      ${request.status === 'approved' ? `Approved by: ${request.approved_by_member?.first_name} ${request.approved_by_member?.last_name}` : ''}
      ${request.approved_at ? `Approved on: ${new Date(request.approved_at).toLocaleDateString()}` : ''}
      
      Generated on: ${new Date().toLocaleDateString()}
      
      MNA Africa Law Firm
      Leave Management System
    `;

    const blob = new Blob([doc], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leave-request-${request.team_member?.first_name}-${request.team_member?.last_name}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Leave request document is being downloaded",
    });
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

    // Add to mock data for demo
    const newRequest: LeaveRequest = {
      id: Date.now().toString(),
      team_member_id: formData.team_member_id,
      start_date: formData.start_date,
      end_date: formData.end_date,
      reason: formData.reason,
      status: 'pending',
      approved_by: null,
      approved_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      team_member: {
        first_name: 'New',
        last_name: 'Employee'
      }
    };

    setLeaveRequests([newRequest, ...leaveRequests]);
    setFormData({ team_member_id: '', start_date: '', end_date: '', reason: '' });
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Leave request submitted successfully",
    });
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

    setLeaveRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'approved', approved_at: new Date().toISOString() }
        : req
    ));

    toast({
      title: "Success",
      description: "Leave request approved",
    });
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

    setLeaveRequests(prev => prev.map(req => 
      req.id === id 
        ? { ...req, status: 'rejected', approved_at: new Date().toISOString() }
        : req
    ));

    toast({
      title: "Success",
      description: "Leave request rejected",
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

      {/* Table View */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests Overview</CardTitle>
        </CardHeader>
        <CardContent>
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
                    {request.team_member?.first_name} {request.team_member?.last_name}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>From: {request.start_date}</div>
                      <div>To: {request.end_date}</div>
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
            </TableBody>
          </Table>
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
                    className="bg-mna-success hover:bg-mna-success/90 text-white flex-1"
                  >
                    <Check size={16} className="mr-1" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleReject(request.id)}
                    className="border-mna-danger text-mna-danger hover:bg-mna-danger hover:text-white flex-1"
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
