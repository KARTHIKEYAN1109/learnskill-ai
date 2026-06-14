import LearningPath from '../models/LearningPath.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getLearningPath = asyncHandler(async (req, res) => {
  const learningPath = await LearningPath.findOne({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ learningPath });
});
