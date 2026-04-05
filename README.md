# TradeSphere

TradeSphere is a full-stack paper-trading and behavioral analytics platform built with Next.js, Prisma, and PostgreSQL.
It helps traders understand both performance and psychology with portfolio analytics, AI coaching, loss insights, competitions, and premium workflows.

## Highlights

- Real-time style paper trading with buy/sell and order type support
- Portfolio tracking with holdings, P&L, and history curves
- Behavioral insights (revenge trading, overtrading, mood impact, risk score)
- Mood and mistakes analytics for self-review
- AI coaching with weekly-style report generation (Groq)
- Email workflows via Resend (OTP API + weekly report email)
- Pro plan gating for premium features
- CSV export for trade history (Pro)
- Trading competitions with leaderboard and countdown

## Tech Stack

- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database ORM: Prisma
- Database: PostgreSQL (Neon-compatible)
- Auth: NextAuth (Credentials provider)
- Charts: Recharts + lightweight-charts
- AI: Groq SDK
- Email: Resend

## Core Product Modules

- Authentication
  - Direct signup/login flow is active
  - OTP APIs and verification page are available in the codebase for optional workflows
- Trading Engine (paper mode)
  - Places and records simulated trades
  - Supports market/limit/stop loss style order metadata
- Portfolio & Dashboard
  - Balance, invested capital, P&L, win rate, fear/greed meter
  - Portfolio value timeline and mood-vs-P&L chart
  - Insights and risk breakdown (with Pro gating where applicable)
- History & Export
  - Filterable trade history
  - CSV export endpoint (Pro gated)
- Competitions
  - Active competition, join flow, countdown, leaderboard ranking
- Pro Plan
  - Feature gating and upgrade endpoint (mock activation)

## Repository Structure

- `app/` -> Pages and API routes (App Router)
- `components/` -> Shared UI components and app shell
- `lib/` -> Domain/business logic (auth, analytics, insights, portfolio, email)
- `prisma/` -> Schema and migration history
- `types/` -> Type augmentations (including NextAuth session typing)

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/ritikaa1802/tradesphere.git
cd tradesphere
npm install
```

### 2. Configure environment

Create `.env` with required values:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"

GROQ_API_KEY="gsk_..."
GROQ_MODEL="llama-3.3-70b-versatile"

RESEND_API_KEY="re_..."

FINNHUB_API_KEY="..."
```

### 3. Run database migrations

```bash
npx prisma migrate dev
```

### 4. Start development server

```bash
npm run dev
```

Open http://localhost:3000

## Build and Production

```bash
npm run build
npm start
```

## NPM Scripts

- `npm run dev` -> Start local dev server
- `npm run build` -> Production build
- `npm start` -> Start production server
- `npm run prisma` -> Run Prisma CLI

## Important Environment Notes

- Resend is used for email sending in:
  - OTP send route
  - Weekly report email route
- Weekly report and CSV export are Pro-gated
- If deploying publicly, set `NEXTAUTH_URL` to your production domain

## Selected API Endpoints

### Auth

- `POST /api/auth/signup` -> Direct account creation
- `POST /api/auth/send-otp` -> Send OTP email (available)
- `POST /api/auth/verify-otp` -> Verify OTP (available)
- `POST /api/auth/[...nextauth]` -> NextAuth credentials login

### Portfolio & Trading

- `GET /api/portfolio`
- `GET /api/portfolio/history`
- `GET /api/portfolio/sectors`
- `POST /api/trade`
- `GET /api/trades`

### Insights, AI, Reports

- `GET /api/insights`
- `POST /api/ai/report`
- `POST /api/ai/chat`
- `POST /api/email/weekly-report` (Pro)

### Pro & Exports

- `POST /api/pro/upgrade`
- `GET /api/export/csv` (Pro)

### Competitions

- `GET /api/competitions`
- `POST /api/competitions/join`
- `GET /api/competitions/leaderboard`

## Security and Best Practices

- Never commit real API keys/secrets to GitHub
- Rotate secrets immediately if accidentally exposed
- Use environment variables in deployment platform settings
- Validate route access with server-side session checks (already used across protected routes)

## Roadmap Ideas

- Real billing integration (Razorpay/Stripe) for Pro
- In-app downloadable weekly report (PDF/HTML)
- Enhanced backtesting and strategy comparison
- Notification center (email + in-app)

## License

This project is private unless a license file is added.

## Author

Built by the TradeSphere team.
