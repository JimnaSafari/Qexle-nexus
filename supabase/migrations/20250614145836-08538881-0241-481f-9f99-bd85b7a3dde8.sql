
-- Create RLS policies for leave_requests table to enable real-time functionality
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view all leave requests (for managers/HR)
CREATE POLICY "Allow viewing all leave requests" 
ON public.leave_requests 
FOR SELECT 
USING (true);

-- Policy to allow creating leave requests
CREATE POLICY "Allow creating leave requests" 
ON public.leave_requests 
FOR INSERT 
WITH CHECK (true);

-- Policy to allow updating leave requests (for approvals)
CREATE POLICY "Allow updating leave requests" 
ON public.leave_requests 
FOR UPDATE 
USING (true);

-- Add foreign key relationships
ALTER TABLE public.leave_requests 
ADD CONSTRAINT fk_leave_requests_team_member 
FOREIGN KEY (team_member_id) REFERENCES public.team_members(id);

ALTER TABLE public.leave_requests 
ADD CONSTRAINT fk_leave_requests_approved_by 
FOREIGN KEY (approved_by) REFERENCES public.team_members(id);

-- Enable realtime for leave_requests
ALTER TABLE public.leave_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.leave_requests;

-- Add RLS policies for invoices table
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Policy to allow viewing all invoices
CREATE POLICY "Allow viewing all invoices" 
ON public.invoices 
FOR SELECT 
USING (true);

-- Policy to allow creating invoices
CREATE POLICY "Allow creating invoices" 
ON public.invoices 
FOR INSERT 
WITH CHECK (true);

-- Policy to allow updating invoices
CREATE POLICY "Allow updating invoices" 
ON public.invoices 
FOR UPDATE 
USING (true);

-- Add foreign key relationships for invoices
ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_client 
FOREIGN KEY (client_id) REFERENCES public.clients(id);

ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_case 
FOREIGN KEY (case_id) REFERENCES public.cases(id);

ALTER TABLE public.invoices 
ADD CONSTRAINT fk_invoices_created_by 
FOREIGN KEY (created_by) REFERENCES public.team_members(id);

-- Enable realtime for invoices
ALTER TABLE public.invoices REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.invoices;
