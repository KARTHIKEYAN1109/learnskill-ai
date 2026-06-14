import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const signAccessToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_ACCESS_SECRET,
  { expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m' }
);

export const signRefreshToken = (user) => jwt.sign(
  { id: user._id, tokenVersion: user.tokenVersion },
  process.env.JWT_REFRESH_SECRET,
  { expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d' }
);

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

export const sendRefreshCookie = (res, token) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};
