# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Favorites Sharing Site is a full-stack web application consisting of a React frontend and Express.js backend. The application allows users to sign in or create accounts and will eventually support sharing favorite items with friends.

## Project Structure

- `favorites-sharing-site-frontend/` - React + Vite frontend application
- `favorites-sharing-site-backend/` - Express.js backend API

Both frontend and backend are ES modules (`"type": "module"` in package.json).

## Development Commands

### Backend (favorites-sharing-site-backend/)
```bash
npm start          # Start the backend server (production)
node src/server.js # Alternative: start the backend server
```
Backend runs on port 3000 (configurable via PORT env var).

### Frontend (favorites-sharing-site-frontend/)
```bash
npm run dev     # Start Vite development server
npm run build   # Build for production
npm run preview # Preview production build
npm run lint    # Run ESLint
```

### Running Both Services
You need to start both services separately:
1. Start backend: `cd favorites-sharing-site-backend && npm start`
2. Start frontend: `cd favorites-sharing-site-frontend && npm run dev`

## Backend Architecture

### Technology Stack
- Express.js 5.2.1
- MongoDB (native driver) for data persistence
- Redis 5.10.0 (installed but not yet implemented)
- CORS enabled for cross-origin requests

### Database
- MongoDB connection URI: `mongodb://localhost:27017` (default)
- Database name: `favorites-sharing-site`
- Collections:
  - `users` - stores user accounts with unique username index

### API Endpoints
- `POST /api/auth/signin` - Sign in or create new account
  - Body: `{ username: string }`
  - Returns: `{ message, user: { username, createdAt }, isNewUser: boolean }`
  - Creates new user if username doesn't exist
  - Returns existing user if username exists

### Server Configuration
- Port: 3000 (default, configurable via PORT env var)
- MongoDB URI: configurable via MONGODB_URI env var
- Graceful shutdown on SIGINT (closes MongoDB connection)

## Frontend Architecture

### Technology Stack
- React 19.2.0
- Vite 7.2.4 for build tooling
- Bootstrap 5.3.8 for styling
- Bootstrap Icons 1.13.1

### Application Structure
- `src/App.jsx` - Main app component with client-side authentication state
- `src/pages/SignInPage.jsx` - Sign in/sign up page
- `src/pages/FavoritesPage.jsx` - Main user page after authentication

### State Management
- Client-side authentication state managed in App.jsx using useState
- No persistent session storage - user state is lost on page refresh
- Sign in/sign out flow handled through callback props

### Styling
- Bootstrap classes used throughout
- Custom gradient styling: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Responsive layout using Bootstrap grid system

## Key Implementation Details

### Authentication Flow
1. User enters username in SignInPage
2. Frontend sends POST to `/api/auth/signin`
3. Backend checks MongoDB for existing user
4. If user exists: returns user data (isNewUser: false)
5. If new: creates user in MongoDB (isNewUser: true)
6. Frontend stores user in state and shows FavoritesPage
7. No password validation or session persistence currently implemented

### Current Limitations
- No password authentication
- No session management (user state lost on refresh)
- No Redis integration yet (dependency installed but unused)
- No persistent login sessions
- Frontend hardcodes backend URL: `http://localhost:3000`

## Important Notes

- MongoDB must be running locally before starting the backend
- Redis is installed but not yet integrated into the application
- The application uses a username-only authentication system (no passwords)
- Session management with Redis needs to be implemented for persistent logins
- CORS is enabled on the backend for all origins
