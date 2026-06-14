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
  const completed = new Set((await Progress.findOne({ user: req.user._id }))?.completedSkills || []);
  completed.add(skill);
  const nextSkill = roadmap.find((item) => !completed.has(item)) || '';
  const percentage = roadmap.length ? Math.round((completed.size / roadmap.length) * 100) : 100;

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id },
    {
      completedSkills: Array.from(completed),
      currentSkill: nextSkill,
      percentage,
      $inc: { xpPoints: 75, streak: 1 },
      level: Math.max(1, Math.floor((completed.size * 75) / 300) + 1),
      lastActivityAt: new Date()
    },
    { new: true, upsert: true }
  );

  res.json({ progress });
});
