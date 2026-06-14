import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  skillsFound: [{ type: String }],
  missingSkills: [{ type: String }],
  recommendedTrack: { type: String, default: '' },
  skillGapScore: { type: Number, min: 0, max: 100, default: 0 },
  estimatedLearningTime: { type: String, default: '' },
  prioritySkills: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('LearningPath', learningPathSchema);
