
import express from 'express';
import { Task } from '../models/Task.js';
import { Case } from '../models/Case.js';
import { Invoice } from '../models/Invoice.js';
import { CalendarEvent } from '../models/CalendarEvent.js';
import { LeaveRequest } from '../models/LeaveRequest.js';
import { File } from '../models/File.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));

    // Get task statistics
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get case statistics
    const caseStats = await Case.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get invoice statistics
    const invoiceStats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    // Get upcoming events (next 7 days)
    const upcomingEvents = await CalendarEvent.find({
      startTime: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }).populate('attendees', 'firstName lastName').limit(5);

    // Get pending leave requests
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });

    // Get recent files
    const recentFiles = await File.find()
      .populate('uploadedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate active tasks count
    const activeTasks = await Task.countDocuments({ 
      status: { $in: ['Pending', 'In Progress'] } 
    });

    // Calculate overdue tasks
    const overdueTasks = await Task.countDocuments({ 
      deadline: { $lt: new Date() },
      status: { $ne: 'Completed' }
    });

    res.json({
      success: true,
      data: {
        summary: {
          activeTasks,
          totalCases: await Case.countDocuments(),
          pendingInvoices: await Invoice.countDocuments({ status: 'Pending' }),
          upcomingEventsCount: upcomingEvents.length,
          pendingLeaves,
          totalFiles: await File.countDocuments(),
          overdueTasks
        },
        taskStats,
        caseStats,
        invoiceStats,
        upcomingEvents,
        recentFiles
      }
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get user-specific dashboard data
router.get('/my-dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user's assigned tasks
    const myTasks = await Task.find({ assignee: userId })
      .populate('createdBy', 'firstName lastName')
      .sort({ deadline: 1 })
      .limit(10);

    // Get user's cases
    const myCases = await Case.find({ assignedTo: userId })
      .populate('clientId', 'name')
      .sort({ dueDate: 1 })
      .limit(10);

    // Get user's upcoming events
    const myEvents = await CalendarEvent.find({
      $or: [
        { attendees: userId },
        { createdBy: userId }
      ],
      startTime: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    }).sort({ startTime: 1 }).limit(5);

    // Get user's leave requests
    const myLeaveRequests = await LeaveRequest.find({ requesterId: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        myTasks,
        myCases,
        myEvents,
        myLeaveRequests,
        summary: {
          myActiveTasks: myTasks.filter(t => t.status !== 'Completed').length,
          myActiveCases: myCases.filter(c => c.status === 'Active').length,
          myUpcomingEvents: myEvents.length,
          myPendingLeaves: myLeaveRequests.filter(l => l.status === 'pending').length
        }
      }
    });
  } catch (error) {
    console.error('Get user dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
