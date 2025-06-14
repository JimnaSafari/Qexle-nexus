import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye } from 'lucide-react';
import jsPDF from 'jspdf';

interface Invoice {
  id: string;
  clientName: string;
  amount: number;
  currency: string;
  status: string;
  dueDate: string;
  createdDate: string;
}

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

  const VAT_RATE = 0.16; // 16% VAT

  const calculateVAT = (amount: number) => {
    return amount * VAT_RATE;
  };

  const calculateTotal = (amount: number) => {
    return amount + calculateVAT(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-mna-success text-white';
      case 'Pending': return 'bg-mna-accent text-mna-primary';
      case 'Overdue': return 'bg-mna-danger text-white';
      case 'Draft': return 'bg-mna-secondary text-mna-primary';
      default: return 'bg-mna-secondary text-mna-primary';
    }
  };

  const generateInvoicePDF = (invoice: Invoice) => {
    try {
      console.log('Starting PDF generation for invoice:', invoice.id);
      
      const subtotal = invoice.amount;
      const vat = calculateVAT(subtotal);
      const total = calculateTotal(subtotal);

      // Create new PDF document
      const doc = new jsPDF();
      
      console.log('PDF document created, adding content...');
      
      // Set up colors and fonts
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      
      // Header - Law Firm Name
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('MNA AFRICA LAW FIRM', 105, 30, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Professional Legal Services', 105, 40, { align: 'center' });
      
      // Invoice title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('INVOICE', 20, 65);
      
      // Invoice details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice Number: ${invoice.id}`, 20, 80);
      doc.text(`Issue Date: ${invoice.createdDate}`, 20, 90);
      doc.text(`Due Date: ${invoice.dueDate}`, 20, 100);
      doc.text(`Status: ${invoice.status}`, 20, 110);
      
      // Client information
      doc.setFont('helvetica', 'bold');
      doc.text('Bill To:', 20, 130);
      doc.setFont('helvetica', 'normal');
      doc.text(invoice.clientName, 20, 140);
      
      // Draw a line
      doc.line(20, 155, 190, 155);
      
      // Invoice items header
      doc.setFont('helvetica', 'bold');
      doc.text('Description', 20, 170);
      doc.text('Amount', 150, 170);
      
      // Draw header line
      doc.line(20, 175, 190, 175);
      
      // Invoice items
      doc.setFont('helvetica', 'normal');
      doc.text('Legal Services', 20, 185);
      doc.text(`${invoice.currency} ${subtotal.toLocaleString()}`, 150, 185);
      
      // VAT line
      doc.text('VAT (16%)', 20, 195);
      doc.text(`${invoice.currency} ${vat.toLocaleString()}`, 150, 195);
      
      // Draw subtotal line
      doc.line(140, 205, 190, 205);
      
      // Total
      doc.setFont('helvetica', 'bold');
      doc.text('Total Amount:', 20, 215);
      doc.text(`${invoice.currency} ${total.toLocaleString()}`, 150, 215);
      
      // Draw final line
      doc.line(140, 220, 190, 220);
      
      // Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', 105, 250, { align: 'center' });
      doc.text('Payment is due within 30 days of invoice date.', 105, 260, { align: 'center' });
      
      // Contact information
      doc.text('MNA Africa Law Firm | Email: info@mnaafrica.com | Phone: +254-xxx-xxxx', 105, 275, { align: 'center' });
      
      console.log('PDF content added, attempting download...');
      
      // Try multiple download methods for better browser compatibility
      try {
        // Method 1: Try direct save first
        const fileName = `${invoice.id}-${invoice.clientName.replace(/\s+/g, '-')}.pdf`;
        doc.save(fileName);
        console.log('Direct save method worked');
        return;
      } catch (saveError) {
        console.log('Direct save failed, trying blob method:', saveError);
        
        // Method 2: Blob method as fallback
        const pdfBlob = doc.output('blob');
        console.log('PDF blob created, size:', pdfBlob.size);
        
        if (pdfBlob.size === 0) {
          throw new Error('Generated PDF blob is empty');
        }
        
        const url = URL.createObjectURL(pdfBlob);
        console.log('Blob URL created:', url);
        
        // Create temporary link element and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${invoice.id}-${invoice.clientName.replace(/\s+/g, '-')}.pdf`;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        console.log('Link added to document, triggering click...');
        
        // Force click event
        link.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          console.log('Cleanup completed');
        }, 100);
        
        console.log('Blob download method completed');
      }
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        invoiceId: invoice.id
      });
      // You could add a toast notification here to inform the user of the error
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    console.log(`Starting download for invoice ${invoice.id}`);
    generateInvoicePDF(invoice);
    console.log(`Download initiated for invoice ${invoice.id} as PDF with 16% VAT included`);
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
          <p className="text-muted-foreground">Create and manage client invoices (16% VAT included)</p>
        </div>
        <Button className="bg-mna-primary hover:bg-mna-primary/90">
          <Plus size={16} className="mr-2" />
          Create Invoice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {invoices.map((invoice) => {
          const subtotal = invoice.amount;
          const vat = calculateVAT(subtotal);
          const total = calculateTotal(subtotal);
          
          return (
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
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="text-sm font-medium">{invoice.currency} {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">VAT (16%):</span>
                  <span className="text-sm font-medium">{invoice.currency} {vat.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-semibold">Total:</span>
                  <span className="text-sm font-bold">{invoice.currency} {total.toLocaleString()}</span>
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
                    onClick={() => handleDownloadPDF(invoice)}
                    className="flex-1 bg-mna-accent hover:bg-mna-accent/90 text-mna-primary"
                  >
                    <Download size={16} className="mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Invoices;
