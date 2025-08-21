import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  files: [{
    originalName: String,
    url: String,
    publicId: String
  }],
  notes: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  feedback: {
    text: String,
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date
  },
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure the model is registered
export default mongoose.models.Submission || mongoose.model('Submission', submissionSchema);