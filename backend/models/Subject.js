import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    default: '#3b82f6', // Default blue
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

export default mongoose.model('Subject', subjectSchema);
