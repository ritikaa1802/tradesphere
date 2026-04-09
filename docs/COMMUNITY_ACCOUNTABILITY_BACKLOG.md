# TradeSphere Community + Accountability Backlog

This document converts the product ideas into implementation-ready work items for Codex.

## Scope

Features included:
1. Accountability Partners (weekly pairing + reviews)
2. Anonymous Trade Sharing (structured feedback feed)
3. Cohort Challenges (discipline-first leaderboard)
4. Mentor Matching (structured guidance)

Guiding principle: optimize for behavior quality, not PnL bragging.

---

## Phase Plan

### Phase 0: Foundations (shared metrics and scoring)

Build first so all four features reuse the same behavior signals.

Tasks:
1. Create a reusable behavior metrics service in `lib/communityMetrics.ts`.
2. Compute per-user, per-week metrics:
   - `tradeCount`
   - `winRate`
   - `ruleBreaks`
   - `emotionDistribution`
   - `avgRiskPerTrade`
   - `checklistCompletionRate`
3. Add discipline score calculator:
   - Positive points for rule compliance and checklist completion.
   - Negative points for overtrading, oversized risk, skipped checklist.
4. Add tests for deterministic score outputs.

Acceptance:
1. Same user/week input must always produce same score output.
2. All later modules consume this service, not custom per-module logic.

---

## Prisma Data Model Backlog

Add these models incrementally (migrations per phase).

### A. Accountability Partners

1. `AccountabilitySettings`
   - `id String @id @default(cuid())`
   - `userId String @unique`
   - `enabled Boolean @default(false)`
   - `updatedAt DateTime @updatedAt`

2. `WeeklySummary`
   - `id String @id @default(cuid())`
   - `userId String`
   - `weekStart DateTime`
   - `weekEnd DateTime`
   - `tradeCount Int @default(0)`
   - `winRate Float @default(0)`
   - `ruleBreaks Int @default(0)`
   - `emotionDistribution Json`
   - `disciplineScore Int @default(0)`
   - `createdAt DateTime @default(now())`
   - `@@unique([userId, weekStart])`

3. `AccountabilityPair`
   - `id String @id @default(cuid())`
   - `weekStart DateTime`
   - `userAId String`
   - `userBId String`
   - `status String @default("active")`
   - `createdAt DateTime @default(now())`

4. `PartnerReview`
   - `id String @id @default(cuid())`
   - `pairId String`
   - `reviewerId String`
   - `reviewedUserId String`
   - `goodPoints String`
   - `mistakes String`
   - `suggestions String`
   - `submittedAt DateTime @default(now())`
   - `@@unique([pairId, reviewerId])`

### B. Anonymous Trade Sharing

5. `SharedTradePost`
   - `id String @id @default(cuid())`
   - `userId String`
   - `tradeId String`
   - `anonymousHandle String`
   - `hidePnl Boolean @default(false)`
   - `entryPrice Float`
   - `exitPrice Float?`
   - `emotion String?`
   - `reason String?`
   - `chartSnapshotUrl String?`
   - `visibility String @default("community")`
   - `createdAt DateTime @default(now())`

6. `PostReaction`
   - `id String @id @default(cuid())`
   - `postId String`
   - `userId String`
   - `reactionType String` // good_setup | risky | rule_break
   - `createdAt DateTime @default(now())`
   - `@@unique([postId, userId])`

7. `StructuredFeedback`
   - `id String @id @default(cuid())`
   - `postId String`
   - `userId String`
   - `entryTiming String`
   - `riskManagement String`
   - `psychology String`
   - `helpfulVotes Int @default(0)`
   - `createdAt DateTime @default(now())`

### C. Cohort Challenges

8. `CohortChallenge`
   - `id String @id @default(cuid())`
   - `title String`
   - `startDate DateTime`
   - `endDate DateTime`
   - `startingCapital Float @default(100000)`
   - `status String @default("active")`

9. `ChallengeParticipant`
   - `id String @id @default(cuid())`
   - `challengeId String`
   - `userId String`
   - `disciplineScore Int @default(0)`
   - `joinedAt DateTime @default(now())`
   - `@@unique([challengeId, userId])`

10. `DisciplineScoreEvent`
   - `id String @id @default(cuid())`
   - `challengeId String`
   - `userId String`
   - `delta Int`
   - `reasonCode String`
   - `reasonText String`
   - `createdAt DateTime @default(now())`

### D. Mentor Matching

11. `MentorProfile`
   - `id String @id @default(cuid())`
   - `userId String @unique`
   - `experienceLevel String`
   - `tradingStyle String`
   - `capacity Int @default(3)`
   - `activeMentees Int @default(0)`
   - `isAvailable Boolean @default(true)`

12. `MentorshipRequest`
   - `id String @id @default(cuid())`
   - `menteeId String`
   - `mentorId String`
   - `status String @default("pending")`
   - `createdAt DateTime @default(now())`

13. `MentorMatch`
   - `id String @id @default(cuid())`
   - `mentorId String`
   - `menteeId String`
   - `status String @default("active")`
   - `startedAt DateTime @default(now())`

14. `MentorFeedbackEntry`
   - `id String @id @default(cuid())`
   - `matchId String`
   - `mentorId String`
   - `weekStart DateTime`
   - `strengths String`
   - `mistakes String`
   - `nextActions String`
   - `createdAt DateTime @default(now())`

---

## API Backlog

Implement in this order.

### Phase 1 APIs (Accountability)

1. `PATCH /api/accountability/settings`
   - Toggle accountability mode.

2. `GET /api/accountability/weekly-summary`
   - Returns my weekly summary + partner summary for active week.

3. `POST /api/accountability/review`
   - Submit structured partner review.

4. `GET /api/accountability/pair`
   - Returns current week pair metadata.

### Phase 2 APIs (Anonymous sharing)

5. `POST /api/community/share-trade`
   - Create anonymous post from a trade.

6. `GET /api/community/feed?sort=helpful|recent`
   - Returns feed cards with sanitized payload.

7. `POST /api/community/reaction`
   - Add/update categorized reaction.

8. `POST /api/community/feedback`
   - Submit structured feedback.

### Phase 3 APIs (Challenges)

9. `POST /api/challenges/join`
10. `GET /api/challenges/current`
11. `GET /api/challenges/leaderboard`
12. `GET /api/challenges/me/events`

### Phase 4 APIs (Mentoring)

13. `GET /api/mentors/list`
14. `POST /api/mentors/request`
15. `POST /api/mentors/request/:id/respond`
16. `POST /api/mentors/feedback`
17. `GET /api/mentors/match`

---

## Jobs and Automation Backlog

Use cron or scheduled server tasks.

1. Weekly summary generation job
   - Every Sunday 23:59 local timezone.

2. Weekly pairing job
   - Every Monday 00:30 after summaries are ready.

3. Pending review reminder job
   - Daily for open weekly pairs with missing partner reviews.

4. Challenge score update job
   - Daily end-of-day score event generation.

5. Mentor feedback reminder job
   - Weekly for active mentor matches without current week feedback.

---

## UI Backlog

### A. Accountability

1. Add settings toggle on `app/settings/page.tsx`.
2. Create `app/accountability/page.tsx`:
   - my summary card
   - partner summary card
   - review form
   - pending review banner

### B. Community Sharing

3. Create `components/ShareTradeModal.tsx`.
4. Create `app/community/page.tsx` feed:
   - sort tabs: helpful/recent
   - reactions
   - structured feedback drawer

### C. Cohort Challenges

5. Create `app/challenges/page.tsx`:
   - join CTA
   - discipline score
   - leaderboard by consistency
   - daily reason-coded score updates

### D. Mentor Matching

6. Create `app/mentors/page.tsx`:
   - mentor list
   - request flow
   - active match panel
   - weekly feedback history

---

## Rollout and Safety

1. Feature flags
   - `communityEnabled`
   - `accountabilityEnabled`
   - `challengesEnabled`
   - `mentorshipEnabled`

2. Moderation rules
   - prevent abusive feedback text
   - rate-limit reactions/comments

3. Privacy constraints
   - never expose `userId` in anonymous feed payloads
   - respect `hidePnl` across all feed views

4. Telemetry events
   - accountability toggle changed
   - partner review submitted
   - trade shared anonymously
   - challenge score event generated
   - mentor feedback submitted

---

## Suggested Delivery Sprints

Sprint 1:
1. Shared metrics service
2. Accountability models + APIs + page

Sprint 2:
1. Anonymous sharing models + APIs + feed page
2. Moderation + helpful ranking

Sprint 3:
1. Cohort challenge models + scoring + leaderboard

Sprint 4:
1. Mentor matching models + request/feedback flows
2. polish + telemetry review

---

## Definition of Done (Module-level)

Each module is done when:
1. Data model and migrations merged.
2. APIs are authenticated and validated.
3. UI screens integrated in sidebar/nav.
4. Background jobs active and observable.
5. Build passes and basic flow tests pass.
