import express from 'express';
import { body } from 'express-validator';
import { getProgress, markSkillComplete } from '../controllers/progressController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, getProgress);
router.post('/complete', protect, [body('skill').trim().notEmpty()], validate, markSkillComplete);

export default router;
