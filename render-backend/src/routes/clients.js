
import express from 'express';
import { body, validationResult } from 'express-validator';
import { Client } from '../models/Client.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const clients = await Client.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Client.countDocuments(filter);

    res.json({
      success: true,
      data: clients,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get clients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new client
router.post('/', auth, [
  body('name').trim().isLength({ min: 2 }),
  body('contactPerson').trim().isLength({ min: 2 }),
  body('email').isEmail(),
  body('phone').trim().isLength({ min: 10 }),
  body('type').isIn(['Corporate', 'Investment', 'Individual', 'Non-Profit'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const clientData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const client = new Client(clientData);
    await client.save();
    await client.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: 'Client created successfully',
      data: client
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Client with this email already exists'
      });
    }
    console.error('Create client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update client
router.put('/:id', auth, [
  body('name').optional().trim().isLength({ min: 2 }),
  body('contactPerson').optional().trim().isLength({ min: 2 }),
  body('email').optional().isEmail(),
  body('phone').optional().trim().isLength({ min: 10 }),
  body('type').optional().isIn(['Corporate', 'Investment', 'Individual', 'Non-Profit']),
  body('status').optional().isIn(['Active', 'Pending', 'Inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const client = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate('createdBy', 'firstName lastName');

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client updated successfully',
      data: client
    });
  } catch (error) {
    console.error('Update client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    res.json({
      success: true,
      message: 'Client deleted successfully'
    });
  } catch (error) {
    console.error('Delete client error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
