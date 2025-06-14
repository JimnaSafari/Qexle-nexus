
import jsPDF from 'jspdf';
import { Invoice } from '@/types/invoice';
import { calculateVAT, calculateTotal } from './invoiceUtils';
import { toast } from '@/components/ui/sonner';

export const generateInvoicePDF = (invoice: Invoice) => {
  try {
    console.log('Starting PDF generation for invoice:', invoice.id);
    toast("Generating PDF...", {
      description: `Creating invoice ${invoice.id}`
    });
    
    const subtotal = invoice.amount;
    const vat = calculateVAT(subtotal);
    const total = calculateTotal(subtotal);

    // Create new PDF document
    const doc = new jsPDF();
    
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
    
    console.log('PDF content created, initiating download...');
    
    // Generate filename
    const fileName = `${invoice.id}-${invoice.clientName.replace(/\s+/g, '-')}.pdf`;
    
    // Simple download approach
    const pdfOutput = doc.output('blob');
    
    if (pdfOutput.size === 0) {
      throw new Error('Generated PDF is empty');
    }
    
    // Create download link
    const url = URL.createObjectURL(pdfOutput);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = fileName;
    downloadLink.style.display = 'none';
    
    // Append to body, click, and remove
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    console.log('PDF download completed successfully');
    toast("PDF Downloaded!", {
      description: `Invoice ${invoice.id} has been downloaded successfully`
    });
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast("Download Failed", {
      description: `Failed to download invoice ${invoice.id}. Please try again.`,
      duration: 5000
    });
  }
};
