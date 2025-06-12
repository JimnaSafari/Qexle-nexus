
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://qexle-system.onrender.com',
  ENDPOINTS: {
    TEAM: '/api/team',
    LEAVE: '/api/leave',
    APPROVALS: '/api/approvals',
    CASES: '/api/cases',
    CLIENTS: '/api/clients',
    CALENDAR: '/api/calendar',
    INVOICES: '/api/invoices'
  }
};
