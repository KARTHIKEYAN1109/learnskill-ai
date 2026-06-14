import './env.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, async (_accessToken, _refreshToken, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value;
      if (!email) return done(new Error('Google profile has no email'));

      const user = await User.findOneAndUpdate(
        { email },
        {
          $setOnInsert: {
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
            provider: 'google'
          }
        },
        { new: true, upsert: true }
      );

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
}
