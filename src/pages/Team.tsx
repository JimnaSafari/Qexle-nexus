
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Team = () => {
  const teamMembers = [
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
      role: 'Paralegal', 
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
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Senior Associate': return 'default';
      case 'Legal Counsel': return 'secondary';
      case 'Paralegal': return 'outline';
      case 'Junior Associate': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team Directory</h1>
          <p className="text-muted-foreground">Manage law firm staff and roles</p>
        </div>
        <Button className="bg-mna-primary hover:bg-mna-primary/90">
          <Plus size={16} className="mr-2" />
          Add Team Member
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{member.name}</CardTitle>
                <Badge variant={getRoleColor(member.role) as any}>
                  {member.role}
                </Badge>
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
