import User from '../models/User.js';
import LearningPath from '../models/LearningPath.js';
import Progress from '../models/Progress.js';
import Lesson from '../models/Lesson.js';
import Quiz from '../models/Quiz.js';
import asyncHandler from '../utils/asyncHandler.js';

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json({ users });
});

export const platformStats = asyncHandler(async (_req, res) => {
  const [users, learningPaths, lessons, quizzes, progress] = await Promise.all([
    User.countDocuments(),
    LearningPath.countDocuments(),
    Lesson.countDocuments(),
    Quiz.countDocuments(),
    Progress.aggregate([{ $group: { _id: null, xp: { $sum: '$xpPoints' }, avgProgress: { $avg: '$percentage' } } }])
  ]);

  res.json({
    stats: {
      users,
      learningPaths,
      lessons,
      quizzes,
      totalXp: progress[0]?.xp || 0,
      avgProgress: Math.round(progress[0]?.avgProgress || 0)
    }
  });
});
