
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import leaveRoutes from './routes/leave.js';
import taskRoutes from './routes/tasks.js';
import caseRoutes from './routes/cases.js';
import clientRoutes from './routes/clients.js';
import invoiceRoutes from './routes/invoices.js';
import calendarRoutes from './routes/calendar.js';
import fileRoutes from './routes/files.js';
import approvalRoutes from './routes/approvals.js';
import dashboardRoutes from './routes/dashboard.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mna-africa')
  .then(() => logger.info('📦 Connected to MongoDB'))
  .catch(err => logger.error('❌ MongoDB connection error:', err));

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:5173', 'https://lovableproject.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/cases', caseRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 MNA Africa Backend Server running on port ${PORT}`);
  logger.info(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  logger.info(`🗄️  Database: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
});

export default app;
