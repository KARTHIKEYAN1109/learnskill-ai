import UserNote from '../models/UserNote.js';
import asyncHandler from '../utils/asyncHandler.js';

export const upsertNote = asyncHandler(async (req, res) => {
  const note = await UserNote.findOneAndUpdate(
    { user: req.user._id, skill: req.body.skill },
    { content: req.body.content },
    { new: true, upsert: true }
  );
  res.json({ note });
});

export const getNote = asyncHandler(async (req, res) => {
  const note = await UserNote.findOne({ user: req.user._id, skill: req.params.skill });
  res.json({ note });
});
