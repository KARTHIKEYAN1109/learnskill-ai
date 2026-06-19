import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  answer: String
}, { _id: false });

const quizSchema = new mongoose.Schema({
  skill: { type: String, required: true, trim: true },
  questions: [questionSchema]
}, { timestamps: true });

quizSchema.index({ skill: 1 }, { unique: true });

export default mongoose.model('Quiz', quizSchema);
