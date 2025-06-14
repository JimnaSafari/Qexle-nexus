
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_SUPABASE_URL,
  ENDPOINTS: {
    TEAM: '/rest/v1/team_members',
    LEAVE: '/rest/v1/leave_requests',
    APPROVALS: '/rest/v1/approvals',
    CASES: '/rest/v1/cases',
    CLIENTS: '/rest/v1/clients',
    CALENDAR: '/rest/v1/calendar_events',
    INVOICES: '/rest/v1/invoices'
  }
};

// Supabase configuration
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
};
