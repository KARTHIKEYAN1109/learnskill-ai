import Lesson from '../models/Lesson.js';
import Bookmark from '../models/Bookmark.js';
import aiService from '../services/aiService.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/stringUtils.js';

export const generateLesson = asyncHandler(async (req, res) => {
  const skill = req.body.skill.trim();
  let lesson = await Lesson.findOne({ skill: new RegExp(`^${escapeRegex(skill)}$`, 'i') });
  let cached = true;

  if (!lesson) {
    cached = false;
    const generated = await aiService.generateLesson(skill);
    lesson = await Lesson.create({ skill, ...generated });
  }

  const bookmark = await Bookmark.findOne({ user: req.user._id, lesson: lesson._id });
  res.json({ lesson, cached, bookmarked: Boolean(bookmark) });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  res.json({ lesson });
});
