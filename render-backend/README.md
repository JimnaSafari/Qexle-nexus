
# MNA Africa Law Firm - Render Backend

This is the Express.js backend for the MNA Africa Law Firm Management System, designed to be deployed on Render.

## Features

- **Authentication**: JWT-based user authentication with role-based access control
- **Leave Management**: Complete leave request system with approval workflows
- **Team Management**: User and team member management
- **Security**: Rate limiting, CORS, helmet security headers
- **Logging**: Comprehensive logging with Winston
- **Validation**: Input validation with express-validator
- **Error Handling**: Centralized error handling middleware

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Winston

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository and navigate to the render-backend folder:
```bash
cd render-backend
```

2. Install dependencies:
```bash
npm install
```

3. Copy the environment file and configure it:
```bash
cp .env.example .env
```

4. Edit the `.env` file with your configuration:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-super-secure-jwt-secret
MONGODB_URI=mongodb://localhost:27017/mna-africa
```

5. Start the development server:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)

### Leave Management
- `GET /api/leave` - Get leave requests (with filtering)
- `POST /api/leave` - Create new leave request
- `PATCH /api/leave/:id/status` - Approve/reject leave request

### Team Management
- `GET /api/team` - Get team members
- `GET /api/team/:id` - Get specific team member

## Deployment on Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the following configuration:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Add all environment variables from `.env.example`

### Environment Variables for Render

Make sure to set these environment variables in your Render dashboard:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-domain.com
JWT_SECRET=your-production-jwt-secret
MONGODB_URI=your-mongodb-connection-string
```

## Project Structure

```
render-backend/
├── src/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   └── LeaveRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── leave.js
│   ├── utils/
│   │   └── logger.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for specific frontend origins
- **Helmet**: Security headers
- **JWT**: Secure token-based authentication
- **Input Validation**: All inputs validated with express-validator
- **Password Hashing**: bcryptjs with salt rounds

## Contributing

1. Make sure to follow the existing code style
2. Add appropriate validation and error handling
3. Update tests for new features
4. Update documentation as needed

## License

This project is proprietary software for MNA Africa Law Firm.
