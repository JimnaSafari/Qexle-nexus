
import mongoose from 'mongoose';

const caseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  caseNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Pending', 'On Hold'],
    default: 'Active'
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

caseSchema.index({ caseNumber: 1 }, { unique: true });
caseSchema.index({ assignedTo: 1, status: 1 });
caseSchema.index({ clientId: 1 });

export const Case = mongoose.model('Case', caseSchema);
