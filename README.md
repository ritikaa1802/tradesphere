# TradeSphere

TradeSphere is a full-stack paper-trading platform for Indian markets built with Next.js, Prisma, and PostgreSQL.
It combines execution simulation, portfolio analytics, behavioral insights, AI coaching, and contest gameplay.

## What TradeSphere Offers

- Paper trading only: no real-money order placement or settlement
- Real-time style trade terminal with market, limit, and stop-loss flows
- Portfolio tracking with holdings, PnL, allocation, and history charts
- Behavioral analytics: mistakes, mood impact, overtrading, and consistency
- AI coach and AI report generation (Groq)
- Contest hub with join flow, countdowns, leaderboard, and contest room
- Pro feature gating (weekly report + CSV export)
- Authentication with NextAuth credentials + OTP APIs

## Product Features

### 1. Authentication and User Onboarding

- Signup/Login with NextAuth credentials
- OTP send/verify APIs available
- Onboarding flow for trading profile setup
- Protected app routes via middleware

### 2. Trade Terminal (Paper Mode)

- Watchlist-style symbol panel
- Candlestick chart with timeframe switching
- Order controls:
  - Side: Buy / Sell
  - Type: Market / Limit / Stop Loss
  - Mode: Intraday (MIS) / Overnight (NRML)
  - Quantity controls (fixed/auto)
  - Optional target and stop-loss fields
- Pending and historical order tables

### 3. Portfolio and Dashboard

- Virtual account balance and holdings
- Portfolio-level metrics and charts
- Sector exposure and allocation insights
- History timeline and PnL trends

### 4. Analytics and Behavioral Intelligence

- Mistake detection and pattern analytics
- Mood tracking and mood-performance correlation
- AI-generated coaching and feedback summaries

### 5. Contest System

- Contests page with:
  - Featured championship card
  - Live contest cards and filters
  - Upcoming contests + notify action
  - Learning tracks and active battles sections
- Contest APIs:
  - Seed and list contests
  - Join by contest ID
  - Notify registration
  - Suggest contest ideas
- Contest Room (`/competitions/[id]`):
  - Contest status, countdown, participant count
  - Contest-specific leaderboard view
  - "Start paper trading" action to Trade page

### 6. Pro Workflows

- Pro upgrade endpoint and UI gating
- Weekly report generation (email route)
- CSV export route for history

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL (Neon-compatible)
- NextAuth
- Recharts + lightweight-charts
- Groq SDK
- Resend



## Contest Gameplay Flow

1. Open `/competitions`
2. Click Join on a live contest
3. Auto-redirect to `/competitions/[id]` Contest Room
4. Click "Start paper trading"
5. Place simulated trades in `/trade`
6. Track rank and leaderboard updates


## License

Private project unless a license file is added.
