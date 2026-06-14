import express from 'express';
import { body, param } from 'express-validator';
import { getNote, upsertNote } from '../controllers/notesController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.get('/:skill', protect, [param('skill').trim().notEmpty()], validate, getNote);
router.put('/', protect, [
  body('skill').trim().notEmpty(),
  body('content').isString()
], validate, upsertNote);

export default router;
