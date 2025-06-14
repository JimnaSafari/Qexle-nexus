
-- Create enum types for better data integrity
CREATE TYPE user_role AS ENUM ('Senior Associate', 'Legal Counsel', 'Junior Associate', 'Intern', 'Pupil', 'Office Assistant');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE case_status AS ENUM ('active', 'pending', 'closed', 'on_hold');
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

-- Team members table (extends auth.users)
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  company TEXT,
  address TEXT,
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cases table
CREATE TABLE public.cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.team_members(id),
  status case_status DEFAULT 'active',
  priority priority_level DEFAULT 'medium',
  start_date DATE,
  due_date DATE,
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  case_id UUID REFERENCES public.cases(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES public.team_members(id),
  created_by UUID REFERENCES public.team_members(id),
  status task_status DEFAULT 'pending',
  priority priority_level DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Leave requests table
CREATE TABLE public.leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_member_id UUID REFERENCES public.team_members(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status DEFAULT 'pending',
  approved_by UUID REFERENCES public.team_members(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Calendar events table
CREATE TABLE public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  case_id UUID REFERENCES public.cases(id),
  created_by UUID REFERENCES public.team_members(id),
  attendees UUID[] DEFAULT '{}',
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Files table
CREATE TABLE public.files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  case_id UUID REFERENCES public.cases(id),
  uploaded_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES public.cases(id),
  amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  status invoice_status DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE,
  description TEXT,
  created_by UUID REFERENCES public.team_members(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Approvals table (for general approval workflows)
CREATE TABLE public.approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  reference_id UUID,
  requester_id UUID REFERENCES public.team_members(id),
  approver_id UUID REFERENCES public.team_members(id),
  status approval_status DEFAULT 'pending',
  details TEXT,
  priority priority_level DEFAULT 'medium',
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE,
  comments TEXT
);

-- Enable Row Level Security on all tables
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Team members can view all profiles" ON public.team_members
  FOR SELECT USING (true);

CREATE POLICY "Team members can update own profile" ON public.team_members
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for clients (all authenticated users can access)
CREATE POLICY "Authenticated users can view clients" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create clients" ON public.clients
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update clients" ON public.clients
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for cases (all authenticated users can access)
CREATE POLICY "Authenticated users can view cases" ON public.cases
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create cases" ON public.cases
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update cases" ON public.cases
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for tasks (all authenticated users can access)
CREATE POLICY "Authenticated users can view tasks" ON public.tasks
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create tasks" ON public.tasks
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update tasks" ON public.tasks
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for leave_requests
CREATE POLICY "Users can view own leave requests" ON public.leave_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.id = leave_requests.team_member_id
    ) OR
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.role IN ('Senior Associate', 'Legal Counsel')
    )
  );

CREATE POLICY "Users can create own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.id = team_member_id
    )
  );

-- Only Senior Associates can approve leave requests
CREATE POLICY "Only Senior Associates can approve leave requests" ON public.leave_requests
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.role = 'Senior Associate'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.role = 'Senior Associate'
    )
  );

-- RLS Policies for calendar_events (all authenticated users can access)
CREATE POLICY "Authenticated users can view events" ON public.calendar_events
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create events" ON public.calendar_events
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update events" ON public.calendar_events
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for files (all authenticated users can access)
CREATE POLICY "Authenticated users can view files" ON public.files
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can upload files" ON public.files
  FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies for invoices (all authenticated users can access)
CREATE POLICY "Authenticated users can view invoices" ON public.invoices
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create invoices" ON public.invoices
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update invoices" ON public.invoices
  FOR UPDATE TO authenticated USING (true);

-- RLS Policies for approvals (all authenticated users can access)
CREATE POLICY "Authenticated users can view approvals" ON public.approvals
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create approvals" ON public.approvals
  FOR INSERT TO authenticated WITH CHECK (true);

-- Only Senior Associates can approve requests
CREATE POLICY "Only Senior Associates can approve requests" ON public.approvals
  FOR UPDATE TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.role = 'Senior Associate'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.role = 'Senior Associate'
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.team_members (user_id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'Junior Associate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create team member profile on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create storage bucket for files
INSERT INTO storage.buckets (id, name, public) VALUES ('case-files', 'case-files', false);

-- Storage policies for case files - all users can view and upload, only Senior Associates can delete
CREATE POLICY "Authenticated users can view files" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'case-files');

CREATE POLICY "Authenticated users can upload files" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'case-files');

CREATE POLICY "Authenticated users can update files" ON storage.objects
  FOR UPDATE TO authenticated USING (bucket_id = 'case-files');

CREATE POLICY "Only Senior Associates can delete files" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'case-files' AND
    EXISTS (
      SELECT 1 FROM public.team_members 
      WHERE team_members.user_id = auth.uid() 
      AND team_members.role = 'Senior Associate'
    )
  );
