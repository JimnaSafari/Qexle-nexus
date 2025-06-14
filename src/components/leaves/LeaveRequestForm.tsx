
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Calendar, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { calculateDays } from '@/utils/leaveUtils';
import type { TeamMember } from '@/hooks/useLeaveRequests';

interface LeaveRequestFormProps {
  currentUserTeamMember: TeamMember | null;
}

export const LeaveRequestForm = ({ currentUserTeamMember }: LeaveRequestFormProps) => {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
    reason: ''
  });

  console.log('LeaveRequestForm debug:', { currentUserTeamMember, submitting, isDialogOpen });

  const handleSubmitRequest = async () => {
    if (!currentUserTeamMember) {
      toast({
        title: "Error",
        description: "User profile not found. Please refresh the page and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.start_date || !formData.end_date || !formData.reason.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (new Date(formData.start_date) > new Date(formData.end_date)) {
      toast({
        title: "Error",
        description: "End date must be after start date",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log('Submitting leave request:', { 
        team_member_id: currentUserTeamMember.id, 
        ...formData 
      });

      const { error } = await supabase
        .from('leave_requests')
        .insert({
          team_member_id: currentUserTeamMember.id,
          start_date: formData.start_date,
          end_date: formData.end_date,
          reason: formData.reason.trim(),
          status: 'pending'
        });

      if (error) {
        console.error('Error submitting leave request:', error);
        toast({
          title: "Error",
          description: `Failed to submit leave request: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      setFormData({ start_date: '', end_date: '', reason: '' });
      setIsDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Button state and text
  const buttonDisabled = !currentUserTeamMember || submitting;
  const buttonText = submitting 
    ? "Submitting..." 
    : !currentUserTeamMember 
    ? "Loading Profile..." 
    : "Apply for Leave";

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-mna-navy hover:bg-mna-navy/90 w-full sm:w-auto text-mna-navy font-semibold px-6 py-3 text-base"
          disabled={buttonDisabled}
          size="lg"
        >
          <Plus size={20} className="mr-2" />
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Apply for Leave</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!currentUserTeamMember ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Unable to load your profile. Please refresh the page and try again.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg">
                <User size={16} className="text-muted-foreground" />
                <span className="font-medium">
                  {currentUserTeamMember.first_name} {currentUserTeamMember.last_name}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    min={formData.start_date || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              
              {formData.start_date && formData.end_date && (
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Calendar size={16} />
                  <span>Duration: {calculateDays(formData.start_date, formData.end_date)} day(s)</span>
                </div>
              )}
              
              <div>
                <Label htmlFor="reason">Reason for Leave</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  placeholder="Please provide a detailed reason for your leave request..."
                  className="h-24"
                />
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={handleSubmitRequest} 
                  className="flex-1"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
