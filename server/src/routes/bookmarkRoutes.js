import express from 'express';
import { body } from 'express-validator';
import { listBookmarks, toggleBookmark } from '../controllers/bookmarkController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, listBookmarks);
router.post('/toggle', protect, [body('lessonId').isMongoId()], validate, toggleBookmark);

export default router;
