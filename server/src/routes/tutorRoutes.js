import express from 'express';
import { body, param } from 'express-validator';
import { askTutor, getTutorHistory } from '../controllers/tutorController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/ask', protect, [
  body('skill').trim().notEmpty(),
  body('question').trim().isLength({ min: 2 })
], validate, askTutor);
router.get('/history/:skill', protect, [param('skill').trim().notEmpty()], validate, getTutorHistory);

export default router;
