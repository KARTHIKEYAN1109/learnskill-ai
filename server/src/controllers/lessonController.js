import Lesson from '../models/Lesson.js';
import Bookmark from '../models/Bookmark.js';
import aiService from '../services/aiService.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/stringUtils.js';

export const generateLesson = asyncHandler(async (req, res) => {
  const skill = req.body.skill.trim();
  let lesson = await Lesson.findOne({ skill: new RegExp(`^${escapeRegex(skill)}$`, 'i') });
  let cached = true;
  let ai = null;

  if (!lesson) {
    cached = false;
    const generated = await aiService.generateLesson(skill);
    const lessonData = generated.data;
    ai = generated.ai;
    lesson = await Lesson.create({ skill, ...lessonData });
  }

  const bookmark = await Bookmark.findOne({ user: req.user._id, lesson: lesson._id });
  res.json({ lesson, cached, bookmarked: Boolean(bookmark), ai });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new ApiError(404, 'Lesson not found');

  res.json({ lesson });
});
