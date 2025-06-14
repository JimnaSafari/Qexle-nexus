
import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  assignee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

taskSchema.index({ assignee: 1, status: 1 });
taskSchema.index({ deadline: 1 });

export const Task = mongoose.model('Task', taskSchema);
