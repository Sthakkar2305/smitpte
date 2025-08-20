import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Personal Introduction',
      'Read Aloud',
      'Repeat Sentence',
      'Describe Image',
      'Retell Lecture',
      'Answer Short Question',
      'Summarize Written Text',
      'Essay',
      'Multiple Choice, Choose Single Answer',
      'Multiple Choice, Choose Multiple Answers',
      'Re-order Paragraphs',
      'Reading Fill in the Blanks',
      'Reading & Writing Fill in the Blanks',
      'Summarize Spoken Text',
      'Multiple Choice, Choose Multiple Answers (Listening)',
      'Fill in the Blanks (Listening)',
      'Highlight Correct Summary',
      'Multiple Choice, Choose Single Answer (Listening)',
      'Select Missing Word',
      'Highlight Incorrect Words',
      'Write from Dictation'
    ]
  },
  description: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    default: 1
  },
  deadline: {
    type: Date
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
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

export default mongoose.models.Task || mongoose.model('Task', taskSchema);