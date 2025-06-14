
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Paid', 'Overdue'],
    default: 'Draft'
  },
  dueDate: {
    type: Date,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  paidDate: {
    type: Date
  },
  description: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ clientId: 1, status: 1 });
invoiceSchema.index({ dueDate: 1 });

export const Invoice = mongoose.model('Invoice', invoiceSchema);
