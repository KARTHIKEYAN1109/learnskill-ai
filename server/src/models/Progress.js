import mongoose from 'mongoose';

const quizScoreSchema = new mongoose.Schema({
  skill: String,
  score: Number,
  total: Number,
  accuracy: Number,
  attemptedAt: { type: Date, default: Date.now }
}, { _id: false });

const progressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedSkills: [{ type: String }],
  currentSkill: { type: String, default: '' },
  percentage: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  xpPoints: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  quizScores: [quizScoreSchema],
  lastActivityAt: Date
}, { timestamps: true });

export default mongoose.model('Progress', progressSchema);
