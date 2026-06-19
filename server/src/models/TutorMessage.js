import mongoose from 'mongoose';

const tutorMessageSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true }
}, { timestamps: true });

tutorMessageSchema.index({ user: 1, skill: 1 });

export default mongoose.model('TutorMessage', tutorMessageSchema);
