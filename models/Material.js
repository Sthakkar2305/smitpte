import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['grammar', 'template', 'tips'],
    required: true
  },
  language: {
    type: String,
    enum: ['english', 'gujarati', 'both'],
    default: 'english'
  },
  description: {
    type: String
  },
  files: [{
    filename: String,
    originalName: String,
    path: String,
    fileType: String,
    size: Number
  }],
  content: {
    type: String
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

export default mongoose.models.Material || mongoose.model('Material', materialSchema);