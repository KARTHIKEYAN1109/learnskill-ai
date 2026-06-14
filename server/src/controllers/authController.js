import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Progress from '../models/Progress.js';
import ApiError from '../utils/apiError.js';
import asyncHandler from '../utils/asyncHandler.js';
import { clearRefreshCookie, hashToken, sendRefreshCookie, signAccessToken, signRefreshToken } from '../utils/tokenUtils.js';

const authPayload = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  user.refreshTokenHash = hashToken(refreshToken);
  await user.save();
  await Progress.findOneAndUpdate({ user: user._id }, { $setOnInsert: { user: user._id } }, { upsert: true });
  sendRefreshCookie(res, refreshToken);
  return { user, accessToken };
};

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email is already registered');

  const user = await User.create({ name, email, passwordHash: password, provider: 'local' });
  res.status(201).json(await authPayload(user, res));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+passwordHash +refreshTokenHash');
  if (!user || !user.passwordHash || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json(await authPayload(user, res));
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) throw new ApiError(401, 'Refresh token missing');

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshTokenHash');
  if (!user || user.tokenVersion !== decoded.tokenVersion || user.refreshTokenHash !== hashToken(token)) {
    throw new ApiError(401, 'Refresh token invalid');
  }

  res.json(await authPayload(user, res));
});

export const logout = asyncHandler(async (req, res) => {
  clearRefreshCookie(res);

  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (accessToken && process.env.JWT_ACCESS_SECRET) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
      await User.findByIdAndUpdate(decoded.id, { $unset: { refreshTokenHash: 1 }, $inc: { tokenVersion: 1 } });
    } catch {
      // Cookie clearing should succeed even when the access token is missing or expired.
    }
  }

  res.json({ message: 'Logged out' });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user });
});

export const googleCallback = asyncHandler(async (req, res) => {
  const payload = await authPayload(req.user, res);
  const redirect = `${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/oauth?token=${payload.accessToken}`;
  res.redirect(redirect);
});
