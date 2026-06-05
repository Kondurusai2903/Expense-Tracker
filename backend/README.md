# SpendSense – Backend

REST API for the SpendSense expense tracker. Built with Node.js, Express, and PostgreSQL (via Prisma).

---

## Tech Stack

- Node.js + Express
- Prisma ORM
- PostgreSQL (Neon)
- JWT (access + refresh tokens)
- bcryptjs for password hashing
- cookie-parser for HttpOnly cookie handling

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma        # DB models (User, Expense, RefreshToken)
│   └── migrations/          # Migration history
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── expense.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── expense.routes.js
│   ├── lib/
│   │   └── prisma.js        # Prisma client instance
│   └── index.js             # Entry point
├── .env.example
└── package.json
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
JWT_SECRET="your_secret_key_minimum_32_characters"
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Run database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

### 4. Start the dev server

```bash
npm run dev
```

Server runs on `http://localhost:5001`

---

## Authentication Flow

SpendSense uses a stateless JWT flow with two tokens:

| Token | Storage | Expiry | Purpose |
|-------|---------|--------|---------|
| Access token | HttpOnly cookie (`access_token`) | 15 minutes | Authorizes every API request |
| Refresh token | HttpOnly cookie (`refresh_token`) + DB | 7 days | Issues a new access token silently |

**Flow:**
1. `POST /api/auth/login` — sets both cookies, returns user object
2. Every protected request reads `access_token` from cookies automatically
3. On 401, the frontend hits `POST /api/auth/refresh` — old refresh token is deleted, a new pair is issued (rotation)
4. `POST /api/auth/logout` — deletes refresh token from DB and clears both cookies
5. No tokens ever touch `localStorage` or JS-accessible memory

**Cookie settings in production:**
- `httpOnly: true` — not accessible via JS
- `secure: true` — HTTPS only
- `sameSite: 'none'` — required for cross-origin (Vercel frontend + Render backend)

---

## API Endpoints

### Auth

| Method | Endpoint | Auth required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user, sets cookies |
| POST | `/api/auth/login` | No | Login, sets cookies |
| POST | `/api/auth/refresh` | No (uses refresh cookie) | Rotate refresh token, issue new access token |
| POST | `/api/auth/logout` | No (uses refresh cookie) | Revoke refresh token, clear cookies |
| GET | `/api/auth/me` | Yes | Get current user info |

### Expenses

All expense routes require a valid `access_token` cookie.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses for logged-in user |
| POST | `/api/expenses` | Add a new expense |
| PUT | `/api/expenses/:id` | Update an expense |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/expenses/dashboard` | Dashboard summary stats |
| GET | `/api/expenses/analytics` | Analytics data |

### Health Check

```
GET /health
```

Returns `{ "status": "ok", "timestamp": "..." }`

---

## Database Schema

**User**
- `id` – UUID
- `name` – string
- `email` – unique string
- `password` – bcrypt hashed
- `createdAt` – timestamp

**Expense**
- `id` – UUID
- `title` – string
- `amount` – float (in INR ₹)
- `category` – string
- `date` – datetime
- `description` – optional string
- `userId` – foreign key to User
- `createdAt`, `updatedAt` – timestamps

**RefreshToken**
- `id` – UUID
- `token` – unique random hex (128 chars)
- `userId` – foreign key to User (cascade delete)
- `expiresAt` – 7 days from creation
- `createdAt` – timestamp

---

## Scripts

```bash
npm run dev    # Start dev server with nodemon
npm start      # Start production server
```

---

## Deployment (Render)

- **Root Directory:** `backend`
- **Build Command:** `npm install --include=dev && npx prisma generate && npx prisma migrate deploy`
- **Start Command:** `node src/index.js`

Set these environment variables in the Render dashboard:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Neon connection string |
| `JWT_SECRET` | Random secret (32+ chars) |
| `PORT` | `10000` |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | Vercel frontend URL |
