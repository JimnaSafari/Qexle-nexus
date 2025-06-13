
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: number;
  name: string;
  role: string;
  email: string;
  joinDate: string;
  status: string;
}

const Team = () => {
  const { toast } = useToast();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { 
      id: 1, 
      name: 'Sarah Johnson', 
      role: 'Senior Associate', 
      email: 'sarah.johnson@mnaafrica.co.ke',
      joinDate: '2022-03-15',
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Michael Brown', 
      role: 'Legal Counsel', 
      email: 'michael.brown@mnaafrica.co.ke',
      joinDate: '2021-08-20',
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Emily Davis', 
      role: 'Intern', 
      email: 'emily.davis@mnaafrica.co.ke',
      joinDate: '2023-01-10',
      status: 'Active'
    },
    { 
      id: 4, 
      name: 'David Wilson', 
      role: 'Junior Associate', 
      email: 'david.wilson@mnaafrica.co.ke',
      joinDate: '2023-06-05',
      status: 'Active'
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    email: '',
    joinDate: '',
    status: 'Active'
  });

  const roles = ['Senior Associate', 'Legal Counsel', 'Intern', 'Junior Associate', 'Pupil', 'Office Assistant'];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Senior Associate': return 'default';
      case 'Legal Counsel': return 'secondary';
      case 'Intern': return 'outline';
      case 'Junior Associate': return 'secondary';
      case 'Pupil': return 'outline';
      case 'Office Assistant': return 'outline';
      default: return 'outline';
    }
  };

  const handleAddMember = () => {
    if (!formData.name || !formData.role || !formData.email || !formData.joinDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newMember: TeamMember = {
      id: Date.now(),
      ...formData
    };

    setTeamMembers([...teamMembers, newMember]);
    setFormData({ name: '', role: '', email: '', joinDate: '', status: 'Active' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Team member added successfully",
    });
  };

  const handleEditMember = () => {
    if (!editingMember || !formData.name || !formData.role || !formData.email || !formData.joinDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setTeamMembers(teamMembers.map(member => 
      member.id === editingMember.id 
        ? { ...member, ...formData }
        : member
    ));
    setEditingMember(null);
    setFormData({ name: '', role: '', email: '', joinDate: '', status: 'Active' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Team member updated successfully",
    });
  };

  const handleDeleteMember = (id: number) => {
    setTeamMembers(teamMembers.filter(member => member.id !== id));
    toast({
      title: "Success",
      description: "Team member removed successfully",
    });
  };

  const openEditDialog = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role,
      email: member.email,
      joinDate: member.joinDate,
      status: member.status
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', email: '', joinDate: '', status: 'Active' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Directory</h1>
          <p className="text-muted-foreground">Manage law firm staff and roles</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-mna-primary hover:bg-mna-primary/90">
              <Plus size={16} className="mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add New Team Member'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="joinDate">Join Date</Label>
                <Input
                  id="joinDate"
                  type="date"
                  value={formData.joinDate}
                  onChange={(e) => setFormData({...formData, joinDate: e.target.value})}
                />
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingMember ? handleEditMember : handleAddMember}
                  className="flex-1"
                >
                  {editingMember ? 'Update' : 'Add'} Member
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
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getRoleColor(member.role) as any}>
                    {member.role}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(member)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMember(member.id)}
                    className="text-mna-danger hover:text-mna-danger"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm font-medium">{member.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Join Date:</span>
                <span className="text-sm font-medium">{member.joinDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline" className="border-mna-success text-mna-success">
                  {member.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Team;
