
import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactPerson: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Corporate', 'Investment', 'Individual', 'Non-Profit'],
    required: true
  },
  status: {
    type: String,
    enum: ['Active', 'Pending', 'Inactive'],
    default: 'Active'
  },
  address: {
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

clientSchema.index({ email: 1 }, { unique: true });
clientSchema.index({ status: 1 });

export const Client = mongoose.model('Client', clientSchema);
