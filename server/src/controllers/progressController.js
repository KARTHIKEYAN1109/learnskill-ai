import Progress from '../models/Progress.js';
import LearningPath from '../models/LearningPath.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getProgress = asyncHandler(async (req, res) => {
  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id },
    { $setOnInsert: { user: req.user._id } },
    { new: true, upsert: true }
  );
  res.json({ progress });
});

export const markSkillComplete = asyncHandler(async (req, res) => {
  const { skill } = req.body;
  const path = await LearningPath.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  const roadmap = path?.prioritySkills?.length ? path.prioritySkills : path?.missingSkills || [];
  const existingProgress = await Progress.findOne({ user: req.user._id });
  const completed = new Set(existingProgress?.completedSkills || []);
  const wasCompleted = completed.has(skill);
  completed.add(skill);
  const nextSkill = roadmap.find((item) => !completed.has(item)) || '';
  const completedRoadmapCount = roadmap.filter((item) => completed.has(item)).length;
  const percentage = roadmap.length ? Math.min(100, Math.round((completedRoadmapCount / roadmap.length) * 100)) : 100;

  const update = {
    completedSkills: Array.from(completed),
    currentSkill: nextSkill,
    percentage,
    level: Math.max(1, Math.floor((completed.size * 75) / 300) + 1),
    lastActivityAt: new Date()
  };

  if (!wasCompleted) {
    update.$inc = { xpPoints: 75, streak: 1 };
  }

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id },
    update,
    { new: true, upsert: true }
  );

  res.json({ progress });
});
