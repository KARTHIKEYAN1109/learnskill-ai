import Quiz from '../models/Quiz.js';
import Progress from '../models/Progress.js';
import aiService from '../services/aiService.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { escapeRegex } from '../utils/stringUtils.js';

export const generateQuiz = asyncHandler(async (req, res) => {
  const skill = req.body.skill.trim();
  let quiz = await Quiz.findOne({ skill: new RegExp(`^${escapeRegex(skill)}$`, 'i') });
  let cached = true;

  if (!quiz) {
    cached = false;
    const generated = await aiService.generateQuiz(skill);
    quiz = await Quiz.create({ skill, questions: generated.questions });
  }

  res.json({ quiz, cached });
});

export const submitQuiz = asyncHandler(async (req, res) => {
  const skill = req.body.skill.trim();
  const { answers } = req.body;
  const quiz = await Quiz.findOne({ skill: new RegExp(`^${escapeRegex(skill)}$`, 'i') });
  if (!quiz) throw new ApiError(404, 'Quiz not found. Generate a quiz before submitting answers.');

  const total = quiz.questions.length;
  if (!total) throw new ApiError(422, 'Quiz has no questions');
  if (answers.length !== total) throw new ApiError(400, `Expected ${total} answers`);

  const score = quiz.questions.reduce((sum, question, index) => sum + (answers[index] === question.answer ? 1 : 0), 0);
  const accuracy = total ? Math.round((score / total) * 100) : 0;

  const progress = await Progress.findOneAndUpdate(
    { user: req.user._id },
    {
      $push: { quizScores: { skill, score, total, accuracy } },
      $inc: { xpPoints: score * 20 },
      lastActivityAt: new Date()
    },
    { new: true, upsert: true }
  );

  res.json({ score, total, accuracy, progress });
});
