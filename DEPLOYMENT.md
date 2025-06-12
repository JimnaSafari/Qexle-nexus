
# Deployment Instructions

## Frontend Deployment on Netlify

### 1. Build the Project
```bash
npm run build
```

### 2. Deploy to Netlify
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variable:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://qexle-system.onrender.com`

### 3. Environment Variables
Set these in your Netlify dashboard under Site settings > Environment variables:
- `VITE_API_BASE_URL`: Your Render backend URL

### 4. Backend API Endpoints
Your Render backend should provide these endpoints:
- `/api/team` - Team information and leave status
- `/api/leave` - Leave requests and status
- `/api/approvals` - Pending approvals
- `/api/cases` - Case files and court information
- `/api/clients` - Client details and contacts
- `/api/calendar` - Schedule and meetings
- `/api/invoices` - Billing and invoice data

### 5. CORS Configuration
Make sure your Render backend allows requests from your Netlify domain.

## Local Development
```bash
npm install
npm run dev
```

The app will connect to your Render backend automatically.
