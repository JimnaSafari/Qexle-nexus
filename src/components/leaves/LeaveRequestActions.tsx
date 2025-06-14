
import { Button } from '@/components/ui/button';
import { Check, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateLeaveRequestPDF } from '@/utils/pdfGenerator';
import type { Database } from '@/integrations/supabase/types';

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row'] & {
  team_member: {
    first_name: string;
    last_name: string;
    email: string;
    department: string;
  };
};

interface LeaveRequestActionsProps {
  request: LeaveRequest;
  isSeniorAssociate: boolean;
  onActionComplete: () => void;
}

const LeaveRequestActions = ({ request, isSeniorAssociate, onActionComplete }: LeaveRequestActionsProps) => {
  const { toast } = useToast();

  const handleApprove = async () => {
    if (!isSeniorAssociate) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can approve leave requests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      onActionComplete();
      toast({
        title: "Success",
        description: "Leave request approved",
      });
    } catch (error) {
      console.error('Error approving leave request:', error);
      toast({
        title: "Error",
        description: "Failed to approve leave request",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!isSeniorAssociate) {
      toast({
        title: "Access Denied",
        description: "Only Senior Associates can reject leave requests",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('leave_requests')
        .update({ 
          status: 'rejected',
          approved_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      onActionComplete();
      toast({
        title: "Success",
        description: "Leave request rejected",
      });
    } catch (error) {
      console.error('Error rejecting leave request:', error);
      toast({
        title: "Error",
        description: "Failed to reject leave request",
        variant: "destructive",
      });
    }
  };

  const handleDownloadPDF = () => {
    generateLeaveRequestPDF(request);
    toast({
      title: "Download Started",
      description: "Leave request document is being downloaded",
    });
  };

  return (
    <div className="flex space-x-2">
      <Button 
        size="sm" 
        variant="outline"
        onClick={handleDownloadPDF}
      >
        <Download size={16} className="mr-1" />
        PDF
      </Button>
      {request.status === 'pending' && isSeniorAssociate && (
        <>
          <Button 
            size="sm" 
            onClick={handleApprove}
            className="bg-mna-success hover:bg-mna-success/90 text-white"
          >
            <Check size={16} className="mr-1" />
            Approve
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleReject}
            className="border-mna-danger text-mna-danger hover:bg-mna-danger hover:text-white"
          >
            <X size={16} className="mr-1" />
            Reject
          </Button>
        </>
      )}
    </div>
  );
};

export default LeaveRequestActions;
