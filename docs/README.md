# Smart Task & Reminder App

A full-stack task management application with AI-powered suggestions, email reminders, and cross-platform support. Built as a monorepo with a shared Node.js/Express backend, React web app, and React Native mobile app.

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                        Clients                           │
│  ┌─────────────────┐          ┌─────────────────────┐    │
│  │  Web (React)    │          │  Mobile (Expo)      │    │
│  │  Vite + Tailwind│          │  React Native       │    │
│  │  Port 5173      │          │  Expo Dev Client    │    │
│  └────────┬────────┘          └────────┬────────────┘    │
└───────────┼────────────────────────────┼─────────────────┘
            │         HTTP + JWT          │
            └────────────┬───────────────┘
                         │
┌────────────────────────┼────────────────────────────────┐
│                    Backend                               │
│  ┌─────────────────────┴──────────────────────────┐     │
│  │         Express API Server (Port 5000)          │     │
│  │  • JWT Auth (signup/login/reset)               │     │
│  │  • Task CRUD with search/filter/sort/paginate  │     │
│  │  • AI Priority Suggestion (Gemini)             │     │
│  │  • node-cron Reminder Job                      │     │
│  └───────┬──────────────────┬──────────────┬──────┘     │
│          │                  │              │             │
│   ┌──────┴──────┐   ┌──────┴──────┐  ┌───┴────────┐    │
│   │  MongoDB    │   │  Nodemailer │  │ Gemini API │    │
│   │  (Atlas)    │   │  (SMTP)     │  │            │    │
│   └─────────────┘   └─────────────┘  └────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- **Node.js** v18+ (v20 recommended)
- **MongoDB** (local or [Atlas](https://www.mongodb.com/atlas))
- **npm** v9+

### 1. Clone & Install

```bash
# Install all dependencies
cd backend && npm install
cd ../web && npm install
cd ../mobile && npm install
```

### 2. Configure Environment

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values (MongoDB URI, JWT secrets, SMTP, etc.)

# Web
cp web/.env.example web/.env

# Mobile
cp mobile/.env.example mobile/.env
```

### 3. Seed Demo Data (Optional)

```bash
cd backend && npm run seed
# Creates demo users: alice@example.com / password123, bob@example.com / password123
```

### 4. Start Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Web
cd web && npm run dev

# Terminal 3 — Mobile
cd mobile && npx expo start
```

- **Backend:** http://localhost:5000
- **Web:** http://localhost:5173
- **API Health:** http://localhost:5000/api/health

---

## API Documentation

### Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

#### POST `/api/auth/signup`
Create a new user account.

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": { "id": "...", "name": "Alice Johnson", "email": "alice@example.com" },
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci..."
  }
}
```

#### POST `/api/auth/login`
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "alice@example.com",
  "password": "password123"
}
```

**Response (200):** Same structure as signup.

#### POST `/api/auth/forgot-password`
Send a password reset email.

**Request Body:**
```json
{ "email": "alice@example.com" }
```

**Response (200):**
```json
{
  "success": true,
  "message": "If an account with that email exists, a reset link has been sent."
}
```

#### POST `/api/auth/reset-password`
Reset password using the token from the email link.

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "newpassword123"
}
```

---

### Tasks (All require authentication)

#### GET `/api/tasks`
List tasks with optional filters.

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Search in title and description |
| `category` | string | Filter by category (Work, Personal, etc.) |
| `priority` | string | Filter by priority (low, medium, high) |
| `completed` | boolean | Filter by completion status |
| `sortBy` | string | Sort field: createdAt, dueDate, priority, title |
| `order` | string | Sort order: asc, desc |
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10, max: 50) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "...",
        "title": "Prepare quarterly report",
        "description": "...",
        "dueDate": "2026-08-08T00:00:00.000Z",
        "priority": "high",
        "category": "Work",
        "completed": false,
        "reminderAt": "2026-08-07T00:00:00.000Z",
        "reminderSent": false,
        "userId": "...",
        "createdAt": "...",
        "updatedAt": "..."
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 42, "pages": 5 }
  }
}
```

#### POST `/api/tasks`
Create a new task.

**Request Body:**
```json
{
  "title": "Review pull requests",
  "description": "Review open PRs on the main repo",
  "dueDate": "2026-08-10T09:00:00.000Z",
  "priority": "medium",
  "category": "Work",
  "reminderAt": "2026-08-10T08:00:00.000Z"
}
```

#### GET `/api/tasks/stats`
Get dashboard statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "pending": 8,
    "completed": 5,
    "overdue": 2,
    "upcomingReminders": 3,
    "total": 13,
    "byCategory": [{ "_id": "Work", "count": 5 }, ...],
    "byPriority": [{ "_id": "high", "count": 3 }, ...]
  }
}
```

#### GET `/api/tasks/:id`
Get a single task by ID.

#### PUT `/api/tasks/:id`
Update a task. Send only the fields you want to change.

#### DELETE `/api/tasks/:id`
Delete a task permanently.

---

### AI (Requires authentication)

#### POST `/api/ai/suggest-priority`
AI suggests priority and category for a task.

**Request Body:**
```json
{
  "title": "Prepare Q3 financial report for board meeting",
  "description": "Compile sales data and create presentation slides"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "priority": "high",
    "category": "Work",
    "reasoning": "Financial reports for board meetings are time-sensitive and business-critical."
  }
}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 5000) |
| `NODE_ENV` | No | development / production |
| `MONGODB_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret for access tokens |
| `JWT_REFRESH_SECRET` | **Yes** | Secret for refresh tokens |
| `JWT_EXPIRES_IN` | No | Access token expiry (default: 1h) |
| `JWT_REFRESH_EXPIRES_IN` | No | Refresh token expiry (default: 7d) |
| `SMTP_HOST` | No | SMTP server host |
| `SMTP_PORT` | No | SMTP server port (default: 587) |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASS` | No | SMTP password |
| `EMAIL_FROM` | No | Sender email address |
| `GEMINI_API_KEY` | No | Google Gemini API key for AI features |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `FRONTEND_URL` | No | Frontend URL for reset links |

### Web (`web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | Backend API URL (default: /api via proxy) |

### Mobile (`mobile/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `API_URL` | **Yes** | Backend API URL (use machine IP for devices) |

---

## Deployment

### Backend → Render / Railway

1. Push the `backend/` directory to a Git repo
2. Create a new Web Service on Render/Railway
3. Set build command: `npm install`
4. Set start command: `node server.js`
5. Add all environment variables from the table above
6. Set `MONGODB_URI` to your Atlas connection string

**Or use Docker:**
```bash
cd backend
docker build -t smart-tasks-api .
docker run -p 5000:5000 --env-file .env smart-tasks-api
```

### Web → Vercel

1. Push the `web/` directory to a Git repo
2. Import to Vercel, set framework to **Vite**
3. Set `VITE_API_URL` to your deployed backend URL
4. The `vercel.json` handles SPA rewrites automatically

### MongoDB → Atlas

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user and whitelist your IP (or 0.0.0.0/0 for cloud)
3. Copy the connection string to `MONGODB_URI`

### Mobile → EAS Build

```bash
cd mobile
npx eas login
npx eas build --profile preview --platform android
# Downloads an APK for testing
```

---

## Testing

```bash
cd backend
npm test
```

Runs Jest + Supertest tests with `mongodb-memory-server` (no external DB needed).

---

## Project Structure

```
smart-task-reminder/
├── backend/
│   ├── config/         # DB connection, env config
│   ├── controllers/    # Route handlers (auth, task, AI)
│   ├── middleware/      # Auth, error handling, validation, rate limiting
│   ├── models/         # Mongoose schemas (User, Task)
│   ├── routes/         # Express route definitions
│   ├── utils/          # Token utils, email, cron job
│   ├── __tests__/      # Jest tests
│   ├── server.js       # Express app entry point
│   ├── seed.js         # Demo data seeder
│   └── Dockerfile
├── web/
│   └── src/
│       ├── api/        # Axios instance
│       ├── components/ # Reusable UI components
│       ├── context/    # Auth context
│       ├── hooks/      # Custom hooks
│       └── pages/      # Route pages
├── mobile/
│   └── src/
│       ├── api/        # Axios instance
│       ├── context/    # Auth context
│       ├── navigation/ # React Navigation setup
│       ├── screens/    # App screens
│       └── utils/      # Storage, notifications
└── docs/
    └── README.md       # This file
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, Mongoose, JWT, bcrypt |
| Database | MongoDB (Atlas-ready) |
| Web Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6 |
| Mobile | React Native, Expo SDK 52, React Navigation 6 |
| AI | Google Gemini (gemini-2.0-flash) |
| Email | Nodemailer (Ethereal for dev) |
| Scheduling | node-cron |
| Testing | Jest, Supertest, mongodb-memory-server |

---

## License

MIT
