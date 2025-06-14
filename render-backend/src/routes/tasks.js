
import express from 'express';
import { body, validationResult } from 'express-validator';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all tasks with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority, assignee, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const tasks = await Task.find(filter)
      .populate('assignee', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('caseId', 'title caseNumber')
      .sort({ deadline: 1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Task.countDocuments(filter);

    res.json({
      success: true,
      data: tasks,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new task
router.post('/', auth, [
  body('title').trim().isLength({ min: 3 }),
  body('priority').isIn(['High', 'Medium', 'Low']),
  body('status').isIn(['Pending', 'In Progress', 'Completed']),
  body('assignee').isMongoId(),
  body('deadline').isISO8601()
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

    const { title, description, priority, status, assignee, deadline, caseId } = req.body;

    const task = new Task({
      title,
      description,
      priority,
      status,
      assignee,
      deadline,
      caseId,
      createdBy: req.user.userId
    });

    await task.save();
    await task.populate(['assignee', 'createdBy', 'caseId']);

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update task
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }),
  body('priority').optional().isIn(['High', 'Medium', 'Low']),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed']),
  body('assignee').optional().isMongoId(),
  body('deadline').optional().isISO8601()
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

    const updates = req.body;
    
    // Set completion date if status is changed to Completed
    if (updates.status === 'Completed' && !updates.completedAt) {
      updates.completedAt = new Date();
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).populate(['assignee', 'createdBy', 'caseId']);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
