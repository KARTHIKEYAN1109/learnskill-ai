import express from 'express';
import passport from 'passport';
import { body } from 'express-validator';
import { changePassword, deleteAccount, googleCallback, login, logout, me, refresh, register, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import validate from '../middleware/validate.js';

const router = express.Router();
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_CALLBACK_URL);

const googleFailureRedirect = (reason = 'google_auth_failed') => `${clientUrl}/login?oauth=${encodeURIComponent(reason)}`;

const requireGoogleOAuth = (_req, res, next) => {
  if (!googleConfigured) return res.redirect(googleFailureRedirect('google_not_configured'));
  next();
};

router.post('/register', [
  body('name').trim().isLength({ min: 2 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
], validate, register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], validate, login);

router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', protect, me);
router.patch('/profile', protect, [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
], validate, updateProfile);
router.patch('/password', protect, [
  body('currentPassword').isString().notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
], validate, changePassword);
router.delete('/account', protect, deleteAccount);
router.get('/google', requireGoogleOAuth, passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', requireGoogleOAuth, (req, res, next) => {
  passport.authenticate('google', { session: false }, (error, user) => {
    if (error || !user) return res.redirect(googleFailureRedirect());
    req.user = user;
    next();
  })(req, res, next);
}, googleCallback);

export default router;
