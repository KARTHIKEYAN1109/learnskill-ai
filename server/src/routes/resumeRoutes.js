import express from 'express';
import { analyzeResume } from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/analyze', protect, uploadResume.single('resume'), analyzeResume);

export default router;
