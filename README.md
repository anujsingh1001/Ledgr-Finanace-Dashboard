# Ledgr — Personal Finance Dashboard
# Ledgr — Personal Finance Dashboard

🌐 **Live Demo:** https://ledgr-finance-dashboard-eight.vercel.app

🔗 **Backend API:** https://ledgr-api-l0xf.onrender.com/api/health

Ledgr keeps the existing React/Vite dashboard UI and adds an Express + MongoDB API for authenticated, user-owned financial records.

Ledgr keeps the existing React/Vite dashboard UI and adds an Express + MongoDB API for authenticated, user-owned financial records.

## Architecture

- `src/`: existing React, JSX, Context/reducer, Recharts, CSS, and UI components.
- `src/services/api.js`: one fetch-based API client; credentials are sent as session cookies.
- `server/src/routes`: API endpoint declarations.
- `server/src/controllers`: HTTP request/response handling.
- `server/src/services`: transaction, analytics, and budget business logic.
- `server/src/models`: Mongoose User, Transaction, and Budget schemas.
- `server/src/middleware`: session authentication, Zod validation, and centralized errors.

Transaction flow: React form → API client → Express route → auth/validation middleware → controller → service → Mongoose → MongoDB → JSON response → Context refresh → dashboard.

## Requirements

- Node.js 20+ recommended
- MongoDB 7+ running locally or a MongoDB connection URI

## Setup

### 1. Install frontend dependencies

```bash
npm install
```

### 2. Configure the backend

```bash
cd server
cp .env.example .env
npm install
```

Edit `server/.env` and set `MONGODB_URI` and a unique `SESSION_SECRET` with at least 32 characters. Keep `.env` private. In production, use HTTPS and set `NODE_ENV=production`.

### 3. Start MongoDB

For a local MongoDB installation, start the MongoDB service using the instructions for your operating system. Alternatively, use a managed MongoDB deployment and put its URI in `server/.env`.

### 4. Run the application

Open two terminals from the repository root:

Terminal 1:
```bash
npm run server:dev
```

Terminal 2:
```bash
npm run dev
```

Open the Vite URL printed in the terminal (normally `http://localhost:5173`). Vite proxies `/api` to `http://localhost:4000` for local development.

Create an account from the login screen. Each user's transactions and budgets are scoped to the authenticated session.

### Optional demo data

With MongoDB configured, run:

```bash
npm run server:seed
```

Demo account: `demo@ledgr.local` / `ChangeMe123!`. Change or remove the demo credentials before deploying publicly.

## API overview

All endpoints except health and auth login/register are session-protected.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register and sign in |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/logout` | End current session |
| GET | `/api/auth/me` | Current session user |
| GET | `/api/transactions` | Search/filter/sort/paginate transactions |
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions/:id` | Get one owned transaction |
| PATCH | `/api/transactions/:id` | Update one owned transaction |
| DELETE | `/api/transactions/:id` | Delete one owned transaction |
| GET | `/api/analytics/summary` | Income, expenses, balance, savings rate |
| GET | `/api/analytics/monthly` | Monthly income/expense aggregation |
| GET | `/api/analytics/categories` | Category-wise expense aggregation |
| GET | `/api/budgets?month=YYYY-MM` | List budgets with actual spending |
| POST | `/api/budgets` | Create category/month budget |
| PATCH | `/api/budgets/:id` | Update a budget |
| DELETE | `/api/budgets/:id` | Delete a budget |

Example transaction request:

```json
{
  "date": "2026-10-01",
  "description": "Groceries",
  "amount": 42.75,
  "category": "food",
  "type": "expense"
}
```

Transaction amounts are stored as numeric currency units rounded to two decimal places. For high-precision accounting, integer minor units or Decimal128 would be preferable.

## Tests and build

```bash
npm run lint
npm run build
npm run server:test
```

Backend tests use `mongodb-memory-server`; the first run may need to download a MongoDB binary. Tests and build should be run before considering the project production-ready.

## Security notes

- Passwords are hashed using Argon2id.
- Authentication uses an HttpOnly, SameSite=Lax session cookie; cookies are Secure in production.
- Server ownership checks use the session's user ID, never a client-supplied owner ID.
- Request payloads use Zod validation, auth attempts are rate limited, and Helmet sets security headers.
- CORS is restricted to `CLIENT_ORIGIN`.
- The dashboard's existing Viewer/Admin toggle is retained as a UI demo control only. It is not a security boundary and does not grant server permissions.
- CSV export quotes and escapes values and prefixes formula-leading untrusted values to reduce spreadsheet formula injection risk.
- CSV import and production deployment automation are not included in this version.

## Deployment outline

Deploy the frontend and backend behind HTTPS, configure `CLIENT_ORIGIN` to the frontend origin, set `MONGODB_URI` and a random `SESSION_SECRET`, and ensure the session cookie remains secure. If frontend and API are hosted on different sites, revisit cookie `SameSite` and CSRF strategy carefully; do not simply disable protections.
