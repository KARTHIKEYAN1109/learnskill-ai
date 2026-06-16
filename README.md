# LearnSphere AI

Production-oriented MERN application for AI-powered personalized learning.

## Apps

- `server` - Node.js, Express, MongoDB, Mongoose, JWT auth, Google OAuth, AI service abstraction.
- `client` - React, Vite, Tailwind CSS, React Router, Axios, Context API.

## Quick Start

```bash
npm install
cp server/.env.example server/.env
cp client/.env.example client/.env
npm run dev
```

The client runs on `http://localhost:5173` and the API on `http://localhost:5000`.

## AI Providers

Gemini is the primary provider through `server/src/services/providers/geminiProvider.js`.
Controllers call `services/aiService.js`, so future providers can be added without changing route business logic.

## Google OAuth

Set these server environment variables to enable Google login:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback`
- `CLIENT_URL=http://localhost:5173`

In Google Cloud Console, add the callback URL as an authorized redirect URI for the OAuth 2.0 client.
