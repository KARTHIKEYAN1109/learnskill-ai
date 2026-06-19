import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true },
  title: { type: String, required: true },
  explanation: { type: String, required: true },
  example: { type: String, required: true },
  exercise: { type: String, required: true },
  nextTopic: { type: String, required: true }
}, { timestamps: true });

lessonSchema.index({ skill: 1 }, { unique: true });

export default mongoose.model('Lesson', lessonSchema);
