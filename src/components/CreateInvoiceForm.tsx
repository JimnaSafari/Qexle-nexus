
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FileText } from 'lucide-react';
import { Invoice } from '@/types/invoice';
import { calculateVAT, calculateTotal } from '@/utils/invoiceUtils';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import { toast } from '@/components/ui/sonner';

interface CreateInvoiceFormProps {
  onInvoiceCreated: (invoice: Invoice) => void;
}

const CreateInvoiceForm = ({ onInvoiceCreated }: CreateInvoiceFormProps) => {
  const [formData, setFormData] = useState({
    clientName: '',
    amount: '',
    description: '',
    dueDate: '',
  });

  const [createdInvoice, setCreatedInvoice] = useState<Invoice | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `INV-${timestamp}`;
  };

  const handleCreateInvoice = () => {
    if (!formData.clientName || !formData.amount || !formData.dueDate) {
      toast("Missing Information", {
        description: "Please fill in all required fields"
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast("Invalid Amount", {
        description: "Please enter a valid amount"
      });
      return;
    }

    const invoice: Invoice = {
      id: generateInvoiceNumber(),
      clientName: formData.clientName,
      amount: amount,
      currency: 'KES',
      status: 'Draft',
      dueDate: formData.dueDate,
      createdDate: new Date().toISOString().split('T')[0],
    };

    setCreatedInvoice(invoice);
    onInvoiceCreated(invoice);

    toast("Invoice Created", {
      description: `Invoice ${invoice.id} created successfully with 16% VAT`
    });
  };

  const handleGeneratePDF = () => {
    if (createdInvoice) {
      generateInvoicePDF(createdInvoice);
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: '',
      amount: '',
      description: '',
      dueDate: '',
    });
    setCreatedInvoice(null);
  };

  const subtotal = parseFloat(formData.amount) || 0;
  const vat = calculateVAT(subtotal);
  const total = calculateTotal(subtotal);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus size={20} />
          Create New Invoice
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name *</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              placeholder="Enter client name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (KES) *</Label>
            <Input
              id="amount"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="Enter amount"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Legal services description..."
            rows={3}
          />
        </div>

        {subtotal > 0 && (
          <div className="bg-muted/30 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold text-sm">Invoice Summary:</h3>
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>VAT (16%):</span>
              <span>KES {vat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total:</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!createdInvoice ? (
            <Button 
              onClick={handleCreateInvoice}
              className="flex-1 bg-mna-primary hover:bg-mna-primary/90"
            >
              <Plus size={16} className="mr-2" />
              Create Invoice
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleGeneratePDF}
                className="flex-1 bg-mna-accent hover:bg-mna-accent/90 text-mna-primary"
              >
                <FileText size={16} className="mr-2" />
                Generate PDF
              </Button>
              <Button 
                onClick={resetForm}
                variant="outline"
                className="px-6"
              >
                New Invoice
              </Button>
            </>
          )}
        </div>

        {createdInvoice && (
          <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Invoice <strong>{createdInvoice.id}</strong> created successfully! 
              Click "Generate PDF" to download.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CreateInvoiceForm;
