
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import InvoiceCard from '@/components/InvoiceCard';

const Invoices = () => {
  const invoices: Invoice[] = [
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

  const handleViewInvoice = (invoiceId: string) => {
    console.log(`Viewing invoice ${invoiceId}`);
    // This would open the invoice in a modal or new page
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoice Management</h1>
          <p className="text-muted-foreground">Create and manage client invoices (16% VAT included)</p>
        </div>
        <Button className="bg-mna-primary hover:bg-mna-primary/90">
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {invoices.map((invoice) => (
          <InvoiceCard 
            key={invoice.id} 
            invoice={invoice} 
            onViewInvoice={handleViewInvoice}
          />
        ))}
      </div>
    </div>
  );
};

export default Invoices;
