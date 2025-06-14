import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Download, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateInvoicePDF } from '@/utils/pdfGenerator';
import type { Database } from '@/integrations/supabase/types';

type Invoice = Database['public']['Tables']['invoices']['Row'] & {
  client: Database['public']['Tables']['clients']['Row'] | null;
  case: Database['public']['Tables']['cases']['Row'] | null;
  created_by_member: Database['public']['Tables']['team_members']['Row'] | null;
};

const Invoices = () => {
  const { toast } = useToast();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch invoices from database
  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          client:client_id(
            *
          ),
          case:case_id(
            *
          ),
          created_by_member:created_by(
            *
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch invoices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();

    // Set up real-time subscription
    const channel = supabase
      .channel('invoices-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices'
        },
        () => {
          fetchInvoices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-mna-success text-white';
      case 'sent': return 'bg-mna-accent text-mna-primary';
      case 'overdue': return 'bg-mna-danger text-white';
      case 'draft': return 'bg-mna-secondary text-mna-primary';
      case 'cancelled': return 'bg-gray-500 text-white';
      default: return 'bg-mna-secondary text-mna-primary';
    }
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    generateInvoicePDF(invoice);
    toast({
      title: "Download Started",
      description: "Invoice PDF is being downloaded",
    });
  };

  const handleViewInvoice = (invoiceId: string) => {
    console.log(`Viewing invoice ${invoiceId}`);
    toast({
      title: "View Invoice",
      description: "Invoice viewer would open here",
    });
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

      {loading ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground">Loading invoices...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-all duration-200 hover:scale-105 animate-scale-in">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{invoice.invoice_number}</CardTitle>
                  <Badge className={getStatusColor(invoice.status || 'draft')}>
                    {invoice.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Client:</span>
                  <span className="text-sm font-medium">{invoice.client?.name || 'Unknown Client'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Case:</span>
                  <span className="text-sm font-medium">{invoice.case?.title || 'General Services'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Subtotal:</span>
                  <span className="text-sm font-medium">KES {invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">VAT (16%):</span>
                  <span className="text-sm font-medium">KES {(invoice.tax_amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t pt-2">
                  <span className="text-sm font-semibold">Total:</span>
                  <span className="text-sm font-bold">KES {invoice.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Issue Date:</span>
                  <span className="text-sm font-medium">{new Date(invoice.issue_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Due Date:</span>
                  <span className="text-sm font-medium">{new Date(invoice.due_date).toLocaleDateString()}</span>
                </div>
                {invoice.paid_date && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Paid Date:</span>
                    <span className="text-sm font-medium text-green-600">{new Date(invoice.paid_date).toLocaleDateString()}</span>
                  </div>
                )}
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
          ))}
          {invoices.length === 0 && (
            <div className="col-span-full text-center py-8">
              <div className="text-muted-foreground">No invoices found</div>
              <Button className="mt-4 bg-mna-primary hover:bg-mna-primary/90">
                <Plus size={16} className="mr-2" />
                Create Your First Invoice
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoices;
