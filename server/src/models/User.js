import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, select: false },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
  avatar: String,
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  refreshTokenHash: { type: String, select: false },
  tokenVersion: { type: Number, default: 0 }
}, { timestamps: true });

userSchema.virtual('password').set(function setPassword(password) {
  this.passwordHash = password;
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('passwordHash') || !this.passwordHash) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toJSON = function toJSON() {
  const user = this.toObject({ virtuals: true });
  delete user.passwordHash;
  delete user.refreshTokenHash;
  delete user.__v;
  return user;
};

export default mongoose.model('User', userSchema);
