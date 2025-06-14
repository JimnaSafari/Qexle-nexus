
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

const supabaseUrl = 'https://tsqqfoefpfmvpwofbmbg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzcXFmb2VmcGZtdnB3b2ZibWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDI0NzcsImV4cCI6MjA2NTQ3ODQ3N30.qcDbF6l_fzh605OfyM05d9z5J1OB3hlG6sCnv2sKeMU';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Database types - these now match the actual database schema
export interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  department: string;
  phone?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface LeaveRequest {
  id: string;
  team_member_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Case {
  id: string;
  title: string;
  client_id: string;
  assigned_to: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  created_at: string;
  updated_at: string;
}
