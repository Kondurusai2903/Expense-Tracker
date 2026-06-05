# SpendSense – Expense Tracker

A full-stack expense tracking web app. Track daily spending, set a monthly budget, and visualize spending patterns with charts.

Live demo: https://expense-tracker-2bek.onrender.com

---

## Repositories

This is a monorepo with two separate apps:

| Folder | Description |
|--------|-------------|
| [`/backend`](./backend) | Node.js + Express REST API |
| [`/frontend`](./frontend) | React + Vite web app |

See each folder's README for setup and deployment instructions.

---

## Features

- User registration and login (JWT access + refresh tokens via HttpOnly cookies)
- Add, edit, delete expenses
- Dashboard with monthly spend, savings, and recent transactions
- Analytics page with bar and pie charts, year/month filter
- Configurable monthly budget and income
- Dark and light theme
- Fully responsive (mobile + desktop)

---

## Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npx prisma migrate deploy
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL=http://localhost:5001
npm run dev
```

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS v4, Recharts, React Hook Form, Zod

**Backend:** Node.js, Express, Prisma, PostgreSQL (Neon), JWT
