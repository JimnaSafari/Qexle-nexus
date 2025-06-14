
import express from 'express';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Placeholder routes for cases
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Cases API endpoint - ready for implementation'
  });
});

export default router;
