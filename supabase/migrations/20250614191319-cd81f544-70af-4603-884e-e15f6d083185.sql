
-- Add Row Level Security policies for calendar_events table
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own events
CREATE POLICY "Users can view their own calendar events" 
  ON public.calendar_events 
  FOR SELECT 
  USING (created_by = auth.uid());

-- Policy for users to insert their own events
CREATE POLICY "Users can create their own calendar events" 
  ON public.calendar_events 
  FOR INSERT 
  WITH CHECK (created_by = auth.uid());

-- Policy for users to update their own events
CREATE POLICY "Users can update their own calendar events" 
  ON public.calendar_events 
  FOR UPDATE 
  USING (created_by = auth.uid());

-- Policy for users to delete their own events
CREATE POLICY "Users can delete their own calendar events" 
  ON public.calendar_events 
  FOR DELETE 
  USING (created_by = auth.uid());
