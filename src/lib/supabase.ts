
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
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
