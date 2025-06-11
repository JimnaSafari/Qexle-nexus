
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Mail, Phone } from 'lucide-react';

const Clients = () => {
  const clients = [
    { 
      id: 1, 
      name: 'TechCorp Industries', 
      contactPerson: 'John Smith',
      email: 'john.smith@techcorp.com',
      phone: '+254 700 123 456',
      type: 'Corporate',
      status: 'Active'
    },
    { 
      id: 2, 
      name: 'Global Investments Ltd', 
      contactPerson: 'Jane Doe',
      email: 'jane.doe@globalinv.com',
      phone: '+254 700 234 567',
      type: 'Investment',
      status: 'Active'
    },
    { 
      id: 3, 
      name: 'Estate Planning Solutions', 
      contactPerson: 'Robert Peterson',
      email: 'robert@estateplanning.com',
      phone: '+254 700 345 678',
      type: 'Individual',
      status: 'Active'
    },
    { 
      id: 4, 
      name: 'Manufacturing Co.', 
      contactPerson: 'Mary Johnson',
      email: 'mary@manufacturing.com',
      phone: '+254 700 456 789',
      type: 'Corporate',
      status: 'Pending'
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Corporate': return 'default';
      case 'Investment': return 'secondary';
      case 'Individual': return 'outline';
      default: return 'outline';
    }
  };

  const handleGenerateInvoice = (clientId: number) => {
    console.log(`Generating invoice for client ${clientId}`);
    // This would integrate with your backend invoice generation
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">Manage clients and generate invoices</p>
        </div>
        <Button className="bg-mna-primary hover:bg-mna-primary/90">
          <Plus size={16} className="mr-2" />
          Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <Badge variant={getTypeColor(client.type) as any}>
                  {client.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Contact Person:</span>
                <span className="text-sm font-medium">{client.contactPerson}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Mail size={14} className="mr-1" />
                  Email:
                </span>
                <span className="text-sm font-medium">{client.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center">
                  <Phone size={14} className="mr-1" />
                  Phone:
                </span>
                <span className="text-sm font-medium">{client.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status:</span>
                <Badge variant="outline" className={client.status === 'Active' ? "border-mna-success text-mna-success" : "border-mna-warning text-mna-warning"}>
                  {client.status}
                </Badge>
              </div>
              <div className="pt-2">
                <Button 
                  onClick={() => handleGenerateInvoice(client.id)}
                  className="w-full bg-mna-accent hover:bg-mna-accent/90 text-mna-primary"
                >
                  <FileText size={16} className="mr-2" />
                  Generate Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Clients;
