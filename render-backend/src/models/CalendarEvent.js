
import mongoose from 'mongoose';

const calendarEventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['Court', 'Client', 'Internal', 'Deadline'],
    default: 'Internal'
  },
  attendees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  caseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Case'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

calendarEventSchema.index({ startTime: 1, endTime: 1 });
calendarEventSchema.index({ attendees: 1 });

export const CalendarEvent = mongoose.model('CalendarEvent', calendarEventSchema);
