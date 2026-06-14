import express from 'express';
import { body, param } from 'express-validator';
import { generateLesson, getLesson } from '../controllers/lessonController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post('/generate', protect, [body('skill').trim().notEmpty()], validate, generateLesson);
router.get('/:id', protect, [param('id').isMongoId()], validate, getLesson);

export default router;
