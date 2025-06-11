
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye } from 'lucide-react';

const Invoices = () => {
  const invoices = [
    { 
      id: 'INV-001', 
      clientName: 'TechCorp Industries',
      amount: 15000,
      currency: 'KES',
      status: 'Paid',
      dueDate: '2024-06-15',
      createdDate: '2024-05-15'
    },
    { 
      id: 'INV-002', 
      clientName: 'Global Investments Ltd',
      amount: 25000,
      currency: 'KES',
      status: 'Pending',
      dueDate: '2024-06-20',
      createdDate: '2024-05-20'
    },
    { 
      id: 'INV-003', 
      clientName: 'Estate Planning Solutions',
      amount: 8000,
      currency: 'KES',
      status: 'Overdue',
      dueDate: '2024-06-01',
      createdDate: '2024-05-01'
    },
    { 
      id: 'INV-004', 
      clientName: 'Manufacturing Co.',
      amount: 12000,
      currency: 'KES',
      status: 'Draft',
      dueDate: '2024-06-25',
      createdDate: '2024-06-10'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-mna-success text-white';
      case 'Pending': return 'bg-mna-accent text-mna-primary';
      case 'Overdue': return 'bg-mna-danger text-white';
      case 'Draft': return 'bg-mna-secondary text-mna-primary';
      default: return 'bg-mna-secondary text-mna-primary';
    }
  };

  const handleDownloadPDF = (invoiceId: string) => {
    console.log(`Downloading PDF for invoice ${invoiceId}`);
    // This would integrate with your backend PDF generation
  };

  const handleViewInvoice = (invoiceId: string) => {
    console.log(`Viewing invoice ${invoiceId}`);
    // This would open the invoice in a modal or new page
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage client invoices</p>
        </div>
        <Button className="bg-mna-primary hover:bg-mna-primary/90">
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{invoice.id}</CardTitle>
                <Badge className={getStatusColor(invoice.status)}>
                  {invoice.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Client:</span>
                <span className="text-sm font-medium">{invoice.clientName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Amount:</span>
                <span className="text-sm font-medium">{invoice.currency} {invoice.amount.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Due Date:</span>
                <span className="text-sm font-medium">{invoice.dueDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium">{invoice.createdDate}</span>
              </div>
              <div className="pt-2 flex space-x-2">
                <Button 
                  onClick={() => handleViewInvoice(invoice.id)}
                  variant="outline"
                  className="flex-1"
                >
                  <Eye size={16} className="mr-2" />
                  View
                </Button>
                <Button 
                  onClick={() => handleDownloadPDF(invoice.id)}
                  className="flex-1 bg-mna-accent hover:bg-mna-accent/90 text-mna-primary"
                >
                  <Download size={16} className="mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Invoices;
