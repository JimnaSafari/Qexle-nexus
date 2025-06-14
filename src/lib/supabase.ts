
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  
  // For development, we'll create a mock client to prevent crashes
  // In production, you must have these environment variables set
  const mockUrl = 'https://placeholder.supabase.co';
  const mockKey = 'placeholder-key';
  
  console.warn('Using placeholder Supabase configuration. Authentication will not work until you connect to Supabase.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
);

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
