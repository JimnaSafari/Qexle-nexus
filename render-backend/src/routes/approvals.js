
import express from 'express';
import { body, validationResult } from 'express-validator';
import { Approval } from '../models/Approval.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all approvals
router.get('/', auth, async (req, res) => {
  try {
    const { status, type, requesterId, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    // If not a senior associate, only show own requests
    if (req.user.role !== 'Senior Associate' && req.user.role !== 'Legal Counsel') {
      filter.requesterId = req.user.userId;
    } else {
      if (requesterId) filter.requesterId = requesterId;
    }
    
    if (status) filter.status = status;
    if (type) filter.type = type;

    const approvals = await Approval.find(filter)
      .populate('requesterId', 'firstName lastName email')
      .populate('approverId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Approval.countDocuments(filter);

    res.json({
      success: true,
      data: approvals,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get approvals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new approval request
router.post('/', auth, [
  body('type').isIn(['Leave', 'Expense', 'Document', 'Case', 'Other']),
  body('title').trim().isLength({ min: 3 }),
  body('priority').optional().isIn(['High', 'Medium', 'Low'])
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

    const approvalData = {
      ...req.body,
      requesterId: req.user.userId
    };

    const approval = new Approval(approvalData);
    await approval.save();
    await approval.populate(['requesterId', 'approverId']);

    res.status(201).json({
      success: true,
      message: 'Approval request created successfully',
      data: approval
    });
  } catch (error) {
    console.error('Create approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update approval status
router.patch('/:id/status', auth, [
  body('status').isIn(['Approved', 'Rejected']),
  body('comments').optional().trim()
], async (req, res) => {
  try {
    // Check if user has permission to approve/reject
    if (req.user.role !== 'Senior Associate' && req.user.role !== 'Legal Counsel') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve/reject requests'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, comments } = req.body;
    const approval = await Approval.findById(req.params.id);

    if (!approval) {
      return res.status(404).json({
        success: false,
        message: 'Approval request not found'
      });
    }

    if (approval.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Approval request has already been processed'
      });
    }

    approval.status = status;
    approval.approverId = req.user.userId;
    approval.approvedAt = new Date();
    if (comments) {
      approval.comments = comments;
    }

    await approval.save();
    await approval.populate(['requesterId', 'approverId']);

    res.json({
      success: true,
      message: `Approval request ${status.toLowerCase()} successfully`,
      data: approval
    });
  } catch (error) {
    console.error('Update approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
