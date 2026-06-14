# LearnSphere AI

## Project Type

AI-Powered Personalized Learning Platform

## Tech Stack

Frontend:

* React
* Vite
* Tailwind CSS

Backend:

* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Google OAuth
* Gemini API

## Current Features

* User Authentication
* Resume Upload
* Resume Analysis
* AI Learning Path Generation
* Lesson Generation
* AI Tutor Chat
* Quiz Generation
* Progress Tracking
* Bookmarks
* Notes

## Gemini Strategy

Hybrid Architecture:

1. Check MongoDB cache first
2. If lesson exists -> return lesson
3. If lesson does not exist -> call Gemini
4. Save generated lesson to MongoDB
5. Use fallback only when Gemini fails

## Known Issues

* /api/auth/me sometimes returns 500
* Gemini lesson generation needs verification
* Tutor formatting needs improvement
* Dashboard UI is incomplete
* Learning experience needs polishing

## Important Rules

* Do NOT rebuild the project from scratch
* Do NOT replace existing architecture
* Fix incrementally
* Preserve MongoDB schemas
* Preserve JWT authentication
* Preserve API routes
* Preserve Gemini integration
* Make small safe changes

## Development Ports

Backend:
5000

Frontend:
5173

If ports are occupied:

Backend:
5001

Frontend:
5174

## Current Goal

Finish the existing LearnSphere AI platform and make it production-ready with a clean UI and stable AI features.
