import TutorMessage from '../models/TutorMessage.js';
import aiService from '../services/aiService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const askTutor = asyncHandler(async (req, res) => {
  const { skill, question } = req.body;
  const history = await TutorMessage.find({ user: req.user._id, skill }).sort({ createdAt: -1 }).limit(10);
  const chronological = history.reverse();

  await TutorMessage.create({ user: req.user._id, skill, role: 'user', content: question });
  const answer = await aiService.askTutor({ skill, question, history: chronological });
  const assistant = await TutorMessage.create({ user: req.user._id, skill, role: 'assistant', content: answer });

  res.json({ answer, message: assistant });
});

export const getTutorHistory = asyncHandler(async (req, res) => {
  const messages = await TutorMessage.find({ user: req.user._id, skill: req.params.skill }).sort({ createdAt: 1 });
  res.json({ messages });
});
