import express from 'express';
import { getLearningPath } from '../controllers/learningPathController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getLearningPath);

export default router;
