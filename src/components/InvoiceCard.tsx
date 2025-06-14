
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Eye } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { calculateVAT, calculateTotal, getStatusColor } from '@/utils/invoiceUtils';
import { generateInvoicePDF } from '@/utils/pdfGenerator';

interface InvoiceCardProps {
  invoice: Invoice;
  onViewInvoice: (invoiceId: string) => void;
}

const InvoiceCard = ({ invoice, onViewInvoice }: InvoiceCardProps) => {
  const subtotal = invoice.amount;
  const vat = calculateVAT(subtotal);
  const total = calculateTotal(subtotal);

  const handleDownloadPDF = () => {
    console.log(`Starting download for invoice ${invoice.id}`);
    generateInvoicePDF(invoice);
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
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
            onClick={() => onViewInvoice(invoice.id)}
            variant="outline"
            className="flex-1"
          >
            <Eye size={16} className="mr-2" />
            View
          </Button>
          <Button 
            onClick={handleDownloadPDF}
            className="flex-1 bg-mna-accent hover:bg-mna-accent/90 text-mna-primary"
          >
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceCard;
