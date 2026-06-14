import express from 'express';
import { listUsers, platformStats } from '../controllers/adminController.js';
import { authorize, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, authorize('admin'));
router.get('/users', listUsers);
router.get('/stats', platformStats);
router.get('/tracks', (_req, res) => {
  res.json({ tracks: ['Full-Stack Cloud Engineer', 'AI Product Engineer', 'DevOps Engineer'] });
});

export default router;
