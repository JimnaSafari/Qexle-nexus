
import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Contract', 'Court Filing', 'Statement', 'Evidence', 'Correspondence', 'Other'],
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  caseNumber: {
    type: String,
    required: true
  },
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

fileSchema.index({ caseNumber: 1 });
fileSchema.index({ uploadedBy: 1 });

export const File = mongoose.model('File', fileSchema);
