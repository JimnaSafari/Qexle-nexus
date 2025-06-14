
import express from 'express';
import { body, validationResult } from 'express-validator';
import { Case } from '../models/Case.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all cases
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;

    const cases = await Case.find(filter)
      .populate('clientId', 'name contactPerson email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Case.countDocuments(filter);

    res.json({
      success: true,
      data: cases,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get cases error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new case
router.post('/', auth, [
  body('title').trim().isLength({ min: 3 }),
  body('clientId').isMongoId(),
  body('assignedTo').isMongoId(),
  body('priority').optional().isIn(['High', 'Medium', 'Low']),
  body('dueDate').optional().isISO8601()
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

    // Generate unique case number
    const year = new Date().getFullYear();
    const lastCase = await Case.findOne({}, {}, { sort: { 'createdAt': -1 } });
    let caseNumber;
    
    if (lastCase && lastCase.caseNumber.startsWith(`CASE-${year}`)) {
      const lastNumber = parseInt(lastCase.caseNumber.split('-')[2]);
      caseNumber = `CASE-${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    } else {
      caseNumber = `CASE-${year}-001`;
    }

    const caseData = {
      ...req.body,
      caseNumber,
      createdBy: req.user.userId
    };

    const newCase = new Case(caseData);
    await newCase.save();
    await newCase.populate(['clientId', 'assignedTo', 'createdBy']);

    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      data: newCase
    });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update case
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }),
  body('assignedTo').optional().isMongoId(),
  body('status').optional().isIn(['Active', 'Closed', 'Pending', 'On Hold']),
  body('priority').optional().isIn(['High', 'Medium', 'Low']),
  body('dueDate').optional().isISO8601()
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

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate(['clientId', 'assignedTo', 'createdBy']);

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      message: 'Case updated successfully',
      data: updatedCase
    });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete case
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedCase = await Case.findByIdAndDelete(req.params.id);

    if (!deletedCase) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    res.json({
      success: true,
      message: 'Case deleted successfully'
    });
  } catch (error) {
    console.error('Delete case error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
