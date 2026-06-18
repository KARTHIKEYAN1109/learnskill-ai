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

  const topicName = lesson.skill;
  const resources = [
    { title: "YouTube Video Guides", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicName)}+tutorial`, type: "video" },
    { title: "Official Documentation Reference", url: `https://www.google.com/search?q=${encodeURIComponent(topicName)}+official+documentation`, type: "docs" }
  ];

  res.json({ lesson, cached, bookmarked: Boolean(bookmark), ai, resources });
});

export const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);
  if (!lesson) throw new ApiError(404, 'Lesson not found');

  const topicName = lesson.skill;
  const resources = [
    { title: "YouTube Video Guides", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topicName)}+tutorial`, type: "video" },
    { title: "Official Documentation Reference", url: `https://www.google.com/search?q=${encodeURIComponent(topicName)}+official+documentation`, type: "docs" }
  ];

  res.json({ lesson, resources });
});
