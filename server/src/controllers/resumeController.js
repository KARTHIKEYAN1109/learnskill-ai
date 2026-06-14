import pdfParse from 'pdf-parse';
import LearningPath from '../models/LearningPath.js';
import Progress from '../models/Progress.js';
import aiService from '../services/aiService.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const analyzeResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Resume PDF is required');

  const parsed = await pdfParse(req.file.buffer);
  const generated = await aiService.analyzeResume(parsed.text.slice(0, 12000));
  const analysis = generated.data;
  const path = await LearningPath.create({ user: req.user._id, ...analysis });

  await Progress.findOneAndUpdate(
    { user: req.user._id },
    { currentSkill: analysis.prioritySkills?.[0] || analysis.missingSkills?.[0] || '', lastActivityAt: new Date() },
    { upsert: true, new: true }
  );

  res.status(201).json({ ...analysis, id: path._id, ai: generated.ai });
});
