
export const generateLeaveRequestPDF = (request: any) => {
  const content = `
MNA AFRICA LAW FIRM
LEAVE REQUEST DOCUMENT
========================================

Employee Information:
Name: ${request.team_member?.first_name} ${request.team_member?.last_name}
Email: ${request.team_member?.email || 'N/A'}
Department: ${request.team_member?.department || 'N/A'}

Leave Details:
Start Date: ${new Date(request.start_date).toLocaleDateString()}
End Date: ${new Date(request.end_date).toLocaleDateString()}
Duration: ${calculateLeaveDuration(request.start_date, request.end_date)} days
Status: ${request.status?.toUpperCase()}

Reason for Leave:
${request.reason}

${request.status === 'approved' ? `
Approval Information:
Approved by: ${request.approved_by_member?.first_name} ${request.approved_by_member?.last_name}
Approved on: ${new Date(request.approved_at).toLocaleDateString()}
` : ''}

${request.status === 'rejected' ? `
Rejection Information:
Rejected by: ${request.approved_by_member?.first_name} ${request.approved_by_member?.last_name}
Rejected on: ${new Date(request.approved_at).toLocaleDateString()}
` : ''}

Request Information:
Submitted on: ${new Date(request.created_at).toLocaleDateString()}
Request ID: ${request.id}

========================================
This document was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

MNA Africa Law Firm
Human Resources Department
Leave Management System
  `;

  downloadAsFile(content, `Leave-Request-${request.team_member?.first_name}-${request.team_member?.last_name}-${request.id.slice(0, 8)}.txt`);
};

export const generateInvoicePDF = (invoice: any) => {
  const subtotal = invoice.amount;
  const vat = invoice.tax_amount || (subtotal * 0.16);
  const total = invoice.total_amount || (subtotal + vat);

  const content = `
MNA AFRICA LAW FIRM
INVOICE
========================================

Invoice Number: ${invoice.invoice_number}
Invoice Date: ${new Date(invoice.issue_date).toLocaleDateString()}
Due Date: ${new Date(invoice.due_date).toLocaleDateString()}

Bill To:
${invoice.client?.name || 'Client Name'}
${invoice.client?.company ? `Company: ${invoice.client.company}` : ''}
${invoice.client?.email ? `Email: ${invoice.client.email}` : ''}
${invoice.client?.phone ? `Phone: ${invoice.client.phone}` : ''}
${invoice.client?.address ? `Address: ${invoice.client.address}` : ''}

Case Information:
${invoice.case?.title || 'General Legal Services'}

========================================
SERVICES RENDERED
========================================

Description: ${invoice.description || 'Legal services provided'}

Amount Breakdown:
Subtotal:                    KES ${subtotal.toLocaleString()}
VAT (16%):                   KES ${vat.toLocaleString()}
----------------------------------------
Total Amount Due:            KES ${total.toLocaleString()}

Payment Status: ${invoice.status?.toUpperCase()}
${invoice.paid_date ? `Paid on: ${new Date(invoice.paid_date).toLocaleDateString()}` : ''}

========================================
PAYMENT TERMS
========================================
Payment is due within 30 days of invoice date.
Late payments may incur additional charges.

Bank Details:
Account Name: MNA Africa Law Firm
Bank: [Bank Name]
Account Number: [Account Number]
SWIFT Code: [SWIFT Code]

Thank you for choosing MNA Africa Law Firm.

========================================
This invoice was generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

MNA Africa Law Firm
Nairobi, Kenya
Email: info@mna.co.ke
Phone: +254 700 000 000
  `;

  downloadAsFile(content, `Invoice-${invoice.invoice_number}-${invoice.client?.name?.replace(/\s+/g, '-') || 'Client'}.txt`);
};

const calculateLeaveDuration = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const timeDiff = end.getTime() - start.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
};

const downloadAsFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
