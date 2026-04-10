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
Implement navigation and a Trade Page Guidance Booklet for a trading app.

GOAL:
User should:
- Open Trade page
- Understand what to do via a short guide
- Click a stock
- Navigate to /stock/[symbol]
- Access full trading screen with Emotional Realism features

---

1. TRADE PAGE (app/trade/page.tsx)

- Display a list of stocks (TCS, RELIANCE, INFY etc.)
- Each stock must be clickable

- On click:
  router.push(`/stock/${symbol}`)

- Add UI styles:
  - cursor-pointer
  - hover:bg-gray-800
  - smooth transition

- Add a small helper text above list:
  "Click any stock to start trading"

---

2. ADD TOP GUIDE BUTTON

- At top of Trade page:
  Add button: "Guide" or "?"

- On click:
  open GuidanceBooklet modal

---

3. GUIDANCE BOOKLET COMPONENT

- Create: components/GuidanceBooklet.tsx
- Modal / overlay design
- Multi-step slides

---

4. BOOKLET CONTENT (SHORT FLOW)

Slide 1:
"Welcome to Trading Simulator"
"This app helps you practice disciplined trading"

Slide 2:
"What to do here"
"Click on any stock to begin"

Slide 3:
"What happens next"
"You will enter a live trading screen with price, news, and pressure signals"

Slide 4:
"Before trading"
"You must log your emotion before placing a trade"

Slide 5:
"Goal"
"Focus on discipline, not just profit"

Slide 6:
Button: "Start Trading"

---

5. BOOKLET UI

- Next / Back buttons
- Progress dots
- Close (X) button
- Smooth transitions

---

6. SHOW LOGIC

- Use localStorage:
  hasSeenTradeGuide = true

- Auto-show guide ONLY if:
  hasSeenTradeGuide is false

- User can reopen anytime using Guide button

---

7. DYNAMIC STOCK PAGE

- Ensure route exists:
  app/stock/[symbol]/page.tsx

- Must:
  - Read symbol from params
  - Display stock info (symbol, price, chart optional)
  - Render PressureSimulation component

---

8. PRESSURE SIMULATION (IMPORTANT)

- Must ALWAYS render (no early return)

- Include:
  - Timer (or simulated timer)
  - Breaking news banner
  - Dismiss button
  - Volatility spike alert

- If market closed:
  Show message:
  "Market Closed — Practice Mode Active"
  BUT still render all features

---

9. TRADE FLOW

- Add Buy / Sell buttons on stock page

- On click:
  Show mandatory emotional check-in modal

- Fields:
  - Emotional state
  - Followed plan
  - Trade reason

- Disable submit until filled

---

FINAL RESULT:

User opens Trade page
→ sees short guide (first time)
→ understands to click stock
→ clicks stock
→ navigates to /stock/[symbol]
→ sees trading environment (timer, news, volatility)
→ places trade with emotional awareness
1. Open `/competitions`
2. Click Join on a live contest
3. Auto-redirect to `/competitions/[id]` Contest Room
4. Click "Start paper trading"
5. Place simulated trades in `/trade`
6. Track rank and leaderboard updates


## License

Private project unless a license file is added.
