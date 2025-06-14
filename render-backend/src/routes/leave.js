
import express from 'express';
import { body, validationResult } from 'express-validator';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all leave requests (with filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { status, userId } = req.query;
    
    let filter = {};
    
    // If not a senior associate, only show own requests
    if (req.user.role !== 'Senior Associate' && req.user.role !== 'Legal Counsel') {
      filter.requesterId = req.user.userId;
    } else if (userId) {
      filter.requesterId = userId;
    }
    
    if (status) {
      filter.status = status;
    }

    const leaveRequests = await LeaveRequest.find(filter)
      .populate('requesterId', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: leaveRequests
    });
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create leave request
router.post('/', auth, [
  body('startDate').isISO8601(),
  body('endDate').isISO8601(),
  body('reason').trim().isLength({ min: 10 })
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

    const { startDate, endDate, reason } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    if (start < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past'
      });
    }

    const leaveRequest = new LeaveRequest({
      requesterId: req.user.userId,
      startDate: start,
      endDate: end,
      reason,
      status: 'pending'
    });

    await leaveRequest.save();
    await leaveRequest.populate('requesterId', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leaveRequest
    });
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Approve/Reject leave request
router.patch('/:id/status', auth, [
  body('status').isIn(['approved', 'rejected']),
  body('comments').optional().trim()
], async (req, res) => {
  try {
    // Check if user has permission to approve/reject
    if (req.user.role !== 'Senior Associate' && req.user.role !== 'Legal Counsel') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to approve/reject leave requests'
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
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request has already been processed'
      });
    }

    leaveRequest.status = status;
    leaveRequest.approvedBy = req.user.userId;
    leaveRequest.approvedAt = new Date();
    if (comments) {
      leaveRequest.comments = comments;
    }

    await leaveRequest.save();
    await leaveRequest.populate(['requesterId', 'approvedBy']);

    res.json({
      success: true,
      message: `Leave request ${status} successfully`,
      data: leaveRequest
    });
  } catch (error) {
    console.error('Update leave request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
