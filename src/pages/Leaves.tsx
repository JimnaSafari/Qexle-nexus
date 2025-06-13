
import { useState } from 'react';
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

interface LeaveRequest {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
}

const Leaves = () => {
  const { toast } = useToast();
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([
    { 
      id: 1, 
      employee: 'Sarah Johnson', 
      type: 'Annual Leave', 
      startDate: '2024-06-20',
      endDate: '2024-06-25',
      status: 'Approved',
      reason: 'Family vacation'
    },
    { 
      id: 2, 
      employee: 'Michael Brown', 
      type: 'Sick Leave', 
      startDate: '2024-06-15',
      endDate: '2024-06-16',
      status: 'Pending',
      reason: 'Medical appointment'
    },
    { 
      id: 3, 
      employee: 'Emily Davis', 
      type: 'Personal Leave', 
      startDate: '2024-06-30',
      endDate: '2024-07-02',
      status: 'Pending',
      reason: 'Personal matters'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee: '',
    type: '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const employees = ['Sarah Johnson', 'Michael Brown', 'Emily Davis', 'David Wilson'];
  const leaveTypes = ['Annual Leave', 'Sick Leave', 'Personal Leave', 'Maternity Leave', 'Emergency Leave'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'mna-success';
      case 'Pending': return 'mna-warning';
      case 'Rejected': return 'mna-danger';
      default: return 'outline';
    }
  };

  const handleAddRequest = () => {
    if (!formData.employee || !formData.type || !formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    const newRequest: LeaveRequest = {
      id: Date.now(),
      ...formData,
      status: 'Pending'
    };

    setLeaveRequests([...leaveRequests, newRequest]);
    setFormData({ employee: '', type: '', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Leave request submitted successfully",
    });
  };

  const handleApprove = (id: number) => {
    setLeaveRequests(leaveRequests.map(request => 
      request.id === id 
        ? { ...request, status: 'Approved' }
        : request
    ));
    toast({
      title: "Success",
      description: "Leave request approved",
    });
  };

  const handleReject = (id: number) => {
    setLeaveRequests(leaveRequests.map(request => 
      request.id === id 
        ? { ...request, status: 'Rejected' }
        : request
    ));
    toast({
      title: "Success",
      description: "Leave request rejected",
    });
  };

  const openAddDialog = () => {
    setFormData({ employee: '', type: '', startDate: '', endDate: '', reason: '' });
    setIsDialogOpen(true);
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
            <Button onClick={openAddDialog} className="bg-mna-navy hover:bg-mna-navy/90">
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
                <Label htmlFor="employee">Employee</Label>
                <Select value={formData.employee} onValueChange={(value) => setFormData({...formData, employee: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee} value={employee}>{employee}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="type">Leave Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaveTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({...formData, endDate: e.target.value})}
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
                <CardTitle className="text-lg">{request.employee}</CardTitle>
                <Badge 
                  variant="outline" 
                  className={`border-${getStatusColor(request.status)} text-${getStatusColor(request.status)}`}
                >
                  {request.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type:</span>
                <Badge variant="secondary">{request.type}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Start Date:</span>
                <span className="text-sm font-medium">{request.startDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">End Date:</span>
                <span className="text-sm font-medium">{request.endDate}</span>
              </div>
              <div className="pt-2">
                <span className="text-sm text-muted-foreground">Reason:</span>
                <p className="text-sm mt-1">{request.reason}</p>
              </div>
              {request.status === 'Pending' && (
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
