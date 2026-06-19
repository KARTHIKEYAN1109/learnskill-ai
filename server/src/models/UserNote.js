import mongoose from 'mongoose';

const userNoteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skill: { type: String, required: true },
  content: { type: String, default: '' }
}, { timestamps: true });

userNoteSchema.index({ user: 1, skill: 1 }, { unique: true });

export default mongoose.model('UserNote', userNoteSchema);
