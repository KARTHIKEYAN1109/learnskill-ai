import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import resumeRoutes from './routes/resumeRoutes.js';
import learningPathRoutes from './routes/learningPathRoutes.js';
import lessonRoutes from './routes/lessonRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
const clientOrigin = process.env.CLIENT_URL ? process.env.CLIENT_URL.replace(/\/$/, '') : 'http://localhost:5173';
app.use(cors({
  origin: clientOrigin,
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 250,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api/auth/google')
}));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LearnSphere AI' });
});

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/learning-path', learningPathRoutes);
app.use('/api/lesson', lessonRoutes);
app.use('/api/tutor', tutorRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
