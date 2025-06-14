
import mongoose from 'mongoose';

const approvalSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Leave', 'Expense', 'Document', 'Case', 'Other'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  referenceType: {
    type: String,
    enum: ['LeaveRequest', 'Task', 'Case', 'Invoice', 'Other']
  },
  comments: {
    type: String,
    trim: true
  },
  approvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

approvalSchema.index({ requesterId: 1, status: 1 });
approvalSchema.index({ approverId: 1, status: 1 });

export const Approval = mongoose.model('Approval', approvalSchema);
