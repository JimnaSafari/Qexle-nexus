
import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Placeholder routes for clients
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Clients API endpoint - ready for implementation'
  });
});

export default router;
