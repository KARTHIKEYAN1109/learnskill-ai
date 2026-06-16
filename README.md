# LearnSphere AI 

LearnSphere AI is a full-stack AI-powered learning platform that analyzes resumes, identifies skill gaps, generates personalized learning paths, and helps users upskill through AI-generated lessons, tutoring, quizzes, and progress tracking.

##  Features

### Authentication

* JWT Authentication
* Refresh Token Support
* Google OAuth Login
* Protected Routes
* Secure Session Management

### Resume Analysis

* PDF Resume Upload
* Resume Text Extraction
* AI-Powered Skill Analysis
* Skill Gap Identification
* Personalized Learning Recommendations

### Learning Platform

* AI-Generated Lessons
* Personalized Learning Paths
* Topic-Based Learning Flow
* Lesson Progress Tracking

### AI Tutor

* Interactive AI Tutor
* Context-Aware Responses
* Beginner-Friendly Explanations
* Practice Tasks and Exercises

### Quiz System

* AI-Generated Quizzes
* Multiple Choice Questions
* Score Tracking
* Answer Review System

### Productivity Features

* Notes Management
* Bookmarks
* Learning Dashboard
* XP Tracking
* Learning Streaks
* Progress Monitoring

### Account Management

* Profile Settings
* Change Password
* Google Account Support
* Account Deletion

---

## Architecture

Resume Upload
↓
PDF Parsing
↓
Gemini AI Analysis
↓
Skill Gap Detection
↓
Learning Path Generation
↓
Lesson Generation
↓
AI Tutor & Quizzes
↓
Progress Tracking
↓
Dashboard Analytics

---

## Tech Stack

### Frontend

* React.js
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JWT
* Refresh Tokens
* Passport.js
* Google OAuth 2.0

### AI Integration

* Google Gemini AI

### Database

* MongoDB Atlas / MongoDB

---

## Security Features

* Password Hashing using bcrypt
* JWT Authentication
* Refresh Token Rotation
* Protected API Routes
* Secure Cookies
* Input Validation
* Error Handling Middleware

---

##  Performance Optimizations

* MongoDB Cache-First Strategy
* AI Response Persistence
* Reduced Gemini API Calls
* Optimized API Structure

---

##  Installation

### Clone Repository

```bash
git clone <your-repository-url>
cd learnsphere-ai
```

### Install Dependencies

```bash
npm install
```

### Client

```bash
npm run dev --workspace client
```

### Server

```bash
npm run dev --workspace server
```

---

## 🔑 Environment Variables

Create a `.env` file inside the server folder:

```env
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

GEMINI_API_KEY=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

CLIENT_URL=http://localhost:5173
```

---

## Screenshots

Add screenshots for:

* Login Page
* Google OAuth
* Resume Upload
* Learning Dashboard
* AI Tutor
* Quiz Interface
* Settings Page
* Bookmarks
* Notes

---

## Key Highlights

* AI-Powered Personalized Learning
* Resume-Based Skill Gap Analysis
* Gemini AI Integration
* Google OAuth Authentication
* MongoDB Cache-First Architecture
* Full MERN Stack Implementation
* Production-Oriented Design

---

##  Author

Karthikeyan J

Built as a full-stack AI learning platform to help learners identify skill gaps and accelerate career growth through personalized AI-assisted education.

