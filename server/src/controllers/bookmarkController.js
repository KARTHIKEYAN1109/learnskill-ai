import Bookmark from '../models/Bookmark.js';
import asyncHandler from '../utils/asyncHandler.js';

export const toggleBookmark = asyncHandler(async (req, res) => {
  const existing = await Bookmark.findOne({ user: req.user._id, lesson: req.body.lessonId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ bookmarked: false });
  }

  await Bookmark.create({ user: req.user._id, lesson: req.body.lessonId });
  res.status(201).json({ bookmarked: true });
});

export const listBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.user._id }).populate('lesson').sort({ createdAt: -1 });
  res.json({ bookmarks });
});
