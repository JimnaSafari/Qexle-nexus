
import { useToast } from '@/hooks/use-toast';
import type { LeaveRequest } from '@/hooks/useLeaveRequests';

export const calculateDays = (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-green-100 text-green-800 border-green-200';
    case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const generatePDF = (request: LeaveRequest) => {
  const { toast } = useToast();
  
  const doc = `
LEAVE REQUEST REPORT
===================

Employee: ${request.team_member?.first_name} ${request.team_member?.last_name}
Email: ${request.team_member?.email}
Start Date: ${request.start_date}
End Date: ${request.end_date}
Status: ${request.status?.toUpperCase()}

Reason:
${request.reason}

${request.status === 'approved' || request.status === 'rejected' ? `
Decision by: ${request.approved_by_member?.first_name} ${request.approved_by_member?.last_name}
Decision date: ${request.approved_at ? new Date(request.approved_at).toLocaleDateString() : 'N/A'}
` : ''}

Generated on: ${new Date().toLocaleDateString()}

MNA Africa Law Firm
Leave Management System
    `;

  const blob = new Blob([doc], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leave-request-${request.team_member?.first_name}-${request.team_member?.last_name}-${request.start_date}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  toast({
    title: "Download Started",
    description: "Leave request document is being downloaded",
  });
};
