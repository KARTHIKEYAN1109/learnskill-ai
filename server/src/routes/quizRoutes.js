import express from 'express';
import { body } from 'express-validator';
import { generateQuiz, submitQuiz } from '../controllers/quizController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/generate', protect, [body('skill').trim().notEmpty()], validate, generateQuiz);
router.post('/submit', protect, [
  body('skill').trim().notEmpty(),
  body('answers').isArray()
], validate, submitQuiz);

export default router;
