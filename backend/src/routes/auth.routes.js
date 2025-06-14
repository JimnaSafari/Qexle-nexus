
import express from 'express';
import {
  register,
  login,
  getMe,
  updateTeamMember,
  changePassword
} from '../controllers/auth.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().notEmpty().withMessage('Role cannot be empty if provided')
];

const registerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('Please include a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required'),
  body('department').notEmpty().withMessage('Department is required')
];

// Public routes
router.post('/login', loginValidation, login);

// Protected routes
router.post('/register', protect, authorize(['admin']), registerValidation, register);
router.get('/me', protect, getMe);
router.put('/update', protect, updateTeamMember);
router.put('/change-password', protect, changePassword);

export default router;
