
import express from 'express';
import { body, validationResult } from 'express-validator';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get all calendar events
router.get('/', auth, async (req, res) => {
  try {
    const { start, end, type, page = 1, limit = 50 } = req.query;
    
    let filter = {};
    
    if (type) filter.type = type;
    
    // Filter by date range if provided
    if (start && end) {
      filter.startTime = {
        $gte: new Date(start),
        $lte: new Date(end)
      };
    }

    const events = await CalendarEvent.find(filter)
      .populate('attendees', 'firstName lastName email')
      .populate('caseId', 'title caseNumber')
      .populate('createdBy', 'firstName lastName')
      .sort({ startTime: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CalendarEvent.countDocuments(filter);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Create new calendar event
router.post('/', auth, [
  body('title').trim().isLength({ min: 3 }),
  body('startTime').isISO8601(),
  body('endTime').isISO8601(),
  body('type').optional().isIn(['Court', 'Client', 'Internal', 'Deadline'])
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

    // Validate that end time is after start time
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    
    if (endTime <= startTime) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user.userId
    };

    const event = new CalendarEvent(eventData);
    await event.save();
    await event.populate(['attendees', 'caseId', 'createdBy']);

    res.status(201).json({
      success: true,
      message: 'Calendar event created successfully',
      data: event
    });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update calendar event
router.put('/:id', auth, [
  body('title').optional().trim().isLength({ min: 3 }),
  body('startTime').optional().isISO8601(),
  body('endTime').optional().isISO8601(),
  body('type').optional().isIn(['Court', 'Client', 'Internal', 'Deadline'])
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

    const event = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate(['attendees', 'caseId', 'createdBy']);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    res.json({
      success: true,
      message: 'Calendar event updated successfully',
      data: event
    });
  } catch (error) {
    console.error('Update calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Delete calendar event
router.delete('/:id', auth, async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Calendar event not found'
      });
    }

    res.json({
      success: true,
      message: 'Calendar event deleted successfully'
    });
  } catch (error) {
    console.error('Delete calendar event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
