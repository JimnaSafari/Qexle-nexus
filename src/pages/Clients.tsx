
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText, Mail, Phone, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  type: string;
  status: string;
}

const Clients = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([
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
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    type: '',
    status: 'Active'
  });

  const clientTypes = ['Corporate', 'Investment', 'Individual', 'Non-Profit'];
  const statuses = ['Active', 'Pending', 'Inactive'];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Corporate': return 'default';
      case 'Investment': return 'secondary';
      case 'Individual': return 'outline';
      default: return 'outline';
    }
  };

  const handleAddClient = () => {
    if (!formData.name || !formData.contactPerson || !formData.email || !formData.phone || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newClient: Client = {
      id: Date.now(),
      ...formData
    };

    setClients([...clients, newClient]);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', type: '', status: 'Active' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Client added successfully",
    });
  };

  const handleEditClient = () => {
    if (!editingClient || !formData.name || !formData.contactPerson || !formData.email || !formData.phone || !formData.type) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setClients(clients.map(client => 
      client.id === editingClient.id 
        ? { ...client, ...formData }
        : client
    ));
    setEditingClient(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', type: '', status: 'Active' });
    setIsDialogOpen(false);
    toast({
      title: "Success",
      description: "Client updated successfully",
    });
  };

  const handleDeleteClient = (id: number) => {
    setClients(clients.filter(client => client.id !== id));
    toast({
      title: "Success",
      description: "Client removed successfully",
    });
  };

  const handleGenerateInvoice = (clientId: number) => {
    const client = clients.find(c => c.id === clientId);
    toast({
      title: "Invoice Generated",
      description: `Invoice generated for ${client?.name}`,
    });
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      contactPerson: client.contactPerson,
      email: client.email,
      phone: client.phone,
      type: client.type,
      status: client.status
    });
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingClient(null);
    setFormData({ name: '', contactPerson: '', email: '', phone: '', type: '', status: 'Active' });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Client Management</h1>
          <p className="text-muted-foreground">Manage clients and generate invoices</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddDialog} className="bg-mna-primary hover:bg-mna-primary/90">
              <Plus size={16} className="mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Company/Client Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter client name"
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="Enter contact person name"
                />
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
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Client Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>{status}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={editingClient ? handleEditClient : handleAddClient}
                  className="flex-1"
                >
                  {editingClient ? 'Update' : 'Add'} Client
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
        {clients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{client.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant={getTypeColor(client.type) as any}>
                    {client.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(client)}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-mna-danger hover:text-mna-danger"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
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
