# SpendSense – Frontend

React frontend for the SpendSense expense tracker.

---

## Tech Stack

- React 18
- Vite
- Tailwind CSS v4
- React Router DOM v6
- React Hook Form + Zod
- Recharts
- Axios

---

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── api/
│   │   ├── axios.js          # Axios instance — withCredentials, silent refresh interceptor
│   │   ├── auth.api.js       # register, login, refresh, logout, getMe
│   │   └── expense.api.js    # CRUD + dashboard + analytics
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.jsx   # Desktop sidebar with nav links
│   │   │   ├── Topbar.jsx    # Top bar
│   │   │   └── BottomNav.jsx # Mobile bottom navigation
│   │   ├── ConfirmModal.jsx
│   │   ├── ExpenseModal.jsx
│   │   ├── ExpenseRow.jsx
│   │   └── StatCard.jsx
│   ├── context/
│   │   ├── AuthContext.jsx   # Auth state (user, login, logout — no token, no localStorage)
│   │   └── ThemeContext.jsx  # Dark/light theme toggle
│   ├── hooks/
│   │   └── useExpenses.js
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Expenses.jsx
│   │   ├── Analytics.jsx
│   │   └── NotFound.jsx
│   ├── utils/
│   │   └── formatters.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── vercel.json
└── vite.config.js
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
VITE_API_URL=http://localhost:5001
```

### 3. Start the dev server

```bash
npm run dev
```

App runs on `http://localhost:5173`

---

## Authentication

Auth is entirely cookie-based — no token is ever stored in `localStorage` or JS memory.

- On login/register the backend sets two HttpOnly cookies: `access_token` (15 min) and `refresh_token` (7 days)
- The Axios instance is configured with `withCredentials: true` so cookies are sent automatically on every request
- A response interceptor catches 401 errors, calls `POST /api/auth/refresh` once, and silently retries all queued requests
- If the refresh also fails (refresh token expired), the user is redirected to `/`
- On logout, `POST /api/auth/logout` is called to revoke the refresh token server-side before cookies are cleared

---

## Features

- **Authentication** – Register and login. Tokens managed via HttpOnly cookies, fully transparent to JS.
- **Dashboard** – Monthly spend, all-time total, savings, and recent 5 transactions.
- **Expenses** – Add, edit, delete expenses with title, amount, category, date, and optional description.
- **Analytics** – Bar chart for monthly spend, pie chart for category breakdown, month/year filters.
- **Dark / Light Theme** – Toggle from sidebar or mobile profile tab. Preference saved to localStorage.
- **Responsive** – Desktop uses sidebar layout. Mobile uses bottom nav with a profile sheet for logout and theme toggle.

---

## Categories

Food, Transport, Shopping, Entertainment, Health, Education, Bills, Other

---

## Amounts

All amounts are in Indian Rupee (₹).

---

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
```

---

## Deployment (Vercel)

- **Root Directory:** `frontend`
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Set this environment variable in the Vercel dashboard:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | Render backend URL (e.g. `https://expense-tracker-2bek.onrender.com`) |

The `vercel.json` file handles React Router by redirecting all routes to `index.html`.
