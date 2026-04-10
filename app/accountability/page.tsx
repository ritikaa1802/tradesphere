"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type Summary = {
  id: string;
  userId: string;
  tradeCount: number;
  winRate: number;
  ruleBreaks: number;
  disciplineScore: number;
  checklistCompletionRate: number;
};

type WeeklySummaryResponse = {
  accountabilityMode: boolean;
  mySummary: Summary;
  partner: { id: string; displayName: string | null } | null;
  partnerSummary: Summary | null;
  outgoingRequest: {
    id: string;
    recipient: { id: string; displayName: string | null };
  } | null;
  pair?: {
    id: string;
    weekStart: string;
    weekEnd: string;
    user1ReviewDone: boolean;
    user2ReviewDone: boolean;
    status: string;
  };
  pendingReview: boolean;
  receivedReview: {
    id: string;
    doneWell: string;
    mistakes: string;
    suggestions: string;
    createdAt: string;
  } | null;
  lastWeekFeedback: {
    id: string;
    doneWell: string;
    mistakes: string;
    suggestions: string;
    createdAt: string;
  } | null;
  reviewHistory: Array<{
    id: string;
    doneWell: string;
    mistakes: string;
    suggestions: string;
    createdAt: string;
    reviewer: { displayName: string | null };
    pair: { weekStart: string };
  }>;
};

type AnalyticsSummaryResponse = {
  winRate: number;
};

type DiscoverUser = {
  id: string;
  displayName: string | null;
  tradingStyle: string | null;
  traderType: string | null;
  disciplineScore: number;
  totalTradesThisWeek: number;
};

type IncomingRequest = {
  pairId: string;
  requester: DiscoverUser;
};

function badgeText(value: string | null | undefined, fallback: string) {
  const text = String(value || "").trim();
  return text || fallback;
}

export default function AccountabilityPage() {
  const [data, setData] = useState<WeeklySummaryResponse | null>(null);
  const [analyticsWinRate, setAnalyticsWinRate] = useState<number | null>(null);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<IncomingRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sendingRequestId, setSendingRequestId] = useState<string | null>(null);
  const [respondingPairId, setRespondingPairId] = useState<string | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [message, setMessage] = useState("");

  const [doneWell, setDoneWell] = useState("");
  const [mistakes, setMistakes] = useState("");
  const [suggestions, setSuggestions] = useState("");

  const loadAccountability = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const [weeklyResponse, analyticsResponse] = await Promise.all([
        fetch("/api/accountability/weekly-summary", { cache: "no-store" }),
        fetch("/api/analytics/summary", { cache: "no-store" }),
      ]);

      if (!weeklyResponse.ok) throw new Error("Failed to load weekly summary");

      const weeklyPayload = (await weeklyResponse.json()) as WeeklySummaryResponse;
      setData(weeklyPayload);

      if (analyticsResponse.ok) {
        const analyticsPayload = (await analyticsResponse.json()) as AnalyticsSummaryResponse;
        setAnalyticsWinRate(analyticsPayload.winRate);
      }

      if (weeklyPayload.accountabilityMode && !weeklyPayload.partner && !weeklyPayload.outgoingRequest) {
        const [discoverResponse, requestsResponse] = await Promise.all([
          fetch("/api/accountability/discover", { cache: "no-store" }),
          fetch("/api/accountability/requests", { cache: "no-store" }),
        ]);

        if (discoverResponse.ok) {
          const discoverPayload = (await discoverResponse.json()) as { users: DiscoverUser[] };
          setDiscoverUsers(discoverPayload.users || []);
        } else {
          setDiscoverUsers([]);
        }

        if (requestsResponse.ok) {
          const requestsPayload = (await requestsResponse.json()) as { requests: IncomingRequest[] };
          setIncomingRequests(requestsPayload.requests || []);
        } else {
          setIncomingRequests([]);
        }
      } else {
        setDiscoverUsers([]);
        setIncomingRequests([]);
      }
    } catch {
      setData(null);
      setDiscoverUsers([]);
      setIncomingRequests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadSummary() {
      try {
        await loadAccountability();
      } catch {
        if (mounted) {
          setData(null);
          setLoading(false);
        }
      }
    }

    loadSummary();
    return () => {
      mounted = false;
    };
  }, [loadAccountability]);

  const filteredDiscoverUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return discoverUsers;
    return discoverUsers.filter((user) => (user.displayName || "").toLowerCase().includes(query));
  }, [discoverUsers, searchTerm]);

  async function sendRequest(targetUserId: string) {
    setSendingRequestId(targetUserId);
    setMessage("");

    try {
      const response = await fetch("/api/accountability/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.error || "Could not send request");
        return;
      }

      await loadAccountability();
      setMessage("Partner request sent");
    } catch {
      setMessage("Could not send request");
    } finally {
      setSendingRequestId(null);
    }
  }

  async function respondToRequest(pairId: string, action: "accept" | "decline") {
    setRespondingPairId(pairId);
    setMessage("");

    try {
      const response = await fetch("/api/accountability/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairId, action }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || `Could not ${action} request`);
        return;
      }

      await loadAccountability();
      setMessage(action === "accept" ? "Partner request accepted" : "Partner request declined");
    } catch {
      setMessage(`Could not ${action} request`);
    } finally {
      setRespondingPairId(null);
    }
  }

  async function cancelOutgoingRequest() {
    if (!data?.outgoingRequest?.id) return;

    setCancellingRequest(true);
    setMessage("");

    try {
      const response = await fetch("/api/accountability/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pairId: data.outgoingRequest.id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || "Could not cancel request");
        return;
      }

      await loadAccountability();
      setMessage("Partner request canceled");
    } catch {
      setMessage("Could not cancel request");
    } finally {
      setCancellingRequest(false);
    }
  }

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!data?.pair?.id || !data.partner?.id) return;

    setSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/accountability/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pairId: data.pair.id,
          revieweeId: data.partner.id,
          doneWell,
          mistakes,
          suggestions,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        setMessage(payload?.error || "Could not submit review");
        return;
      }

      setMessage("Partner review submitted successfully");
      setData({ ...data, pendingReview: false });
      setDoneWell("");
      setMistakes("");
      setSuggestions("");
    } catch {
      setMessage("Could not submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#9ca3af]">Loading accountability data...</section>;
  }

  if (!data) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-rose-400">Could not load accountability data.</section>;
  }

  const partnerName = data.partner?.displayName || "Partner";
  const isSunday = new Date().getDay() === 0;
  const showSundayReminder = isSunday && data.accountabilityMode && Boolean(data.partner) && data.pendingReview;

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="space-y-6">
        {showSundayReminder ? (
          <section className="rounded-xl border border-rose-400/50 bg-rose-500/20 px-4 py-3 text-sm font-semibold text-rose-100">
            ⚠️ Weekly review due today!
          </section>
        ) : null}

        <section className="rounded-xl border border-slate-800 bg-[#0f1629] p-6 shadow-[0_20px_70px_-40px_rgba(15,23,42,0.9)]">
          <h1 className="text-3xl font-semibold text-white">Accountability Partners</h1>
          <p className="mt-2 text-slate-400">Weekly reflection with structured partner feedback.</p>

          {!data.accountabilityMode ? (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-900/80 p-4">
              <p className="text-sm font-medium text-white">Accountability Mode is turned off.</p>
              <p className="mt-1 text-sm text-slate-400">
                Accountability partners help you exchange structured weekly feedback, catch blind spots, and stay disciplined.
              </p>
              <Link
                href="/settings"
                className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Enable in Settings
              </Link>
            </div>
          ) : data.outgoingRequest && !data.partner ? (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="text-sm font-semibold text-amber-100">
                Request sent to {data.outgoingRequest.recipient.displayName || "Partner"} ⏳
              </p>
              <p className="mt-1 text-sm text-amber-200/90">Waiting for them to accept...</p>
              <button
                type="button"
                onClick={cancelOutgoingRequest}
                disabled={cancellingRequest}
                className="mt-3 rounded-md border border-amber-300/50 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:opacity-60"
              >
                {cancellingRequest ? "Canceling..." : "Cancel request"}
              </button>
            </div>
          ) : data.pendingReview ? (
            <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
              You haven't reviewed your partner yet this week.
            </div>
          ) : (
            <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
              Weekly partner review completed.
            </div>
          )}
        </section>

        {data.accountabilityMode && !data.partner && !data.outgoingRequest ? (
          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold text-white">Find a Partner</h2>
              <p className="mt-1 text-sm text-slate-400">Choose who you want to request this week.</p>

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by display name"
                className="mt-4 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
              />

              {filteredDiscoverUsers.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No users available right now.</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {filteredDiscoverUsers.map((user) => (
                    <article key={user.id} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                              {(user.displayName || "U").charAt(0).toUpperCase()}
                            </div>
                            <p className="truncate text-sm font-semibold text-white">{user.displayName || "Unnamed Trader"}</p>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-200">
                              {badgeText(user.tradingStyle, "Intraday")}
                            </span>
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-200">
                              {badgeText(user.traderType, "Beginner")}
                            </span>
                          </div>
                          <div className="mt-2 text-xs text-slate-300">
                            <p>Discipline Score: {user.disciplineScore}</p>
                            <p>Trades this week: {user.totalTradesThisWeek}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => sendRequest(user.id)}
                          disabled={sendingRequestId === user.id}
                          className="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                          {sendingRequestId === user.id ? "Sending..." : "Send Request"}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
              <h2 className="text-lg font-semibold text-white">Incoming Requests</h2>
              <p className="mt-1 text-sm text-slate-400">Review partner requests from other traders.</p>

              {incomingRequests.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">No pending requests</p>
              ) : (
                <div className="mt-4 space-y-3">
                  {incomingRequests.map((request) => (
                    <article key={request.pairId} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">
                          {(request.requester.displayName || "U").charAt(0).toUpperCase()}
                        </div>
                        <p className="text-sm font-semibold text-white">{request.requester.displayName || "Unnamed Trader"}</p>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-200">
                          {badgeText(request.requester.tradingStyle, "Intraday")}
                        </span>
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-200">
                          {badgeText(request.requester.traderType, "Beginner")}
                        </span>
                      </div>

                      <div className="mt-2 text-xs text-slate-300">
                        <p>Discipline Score: {request.requester.disciplineScore}</p>
                        <p>Trades this week: {request.requester.totalTradesThisWeek}</p>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => respondToRequest(request.pairId, "accept")}
                          disabled={respondingPairId === request.pairId}
                          className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          onClick={() => respondToRequest(request.pairId, "decline")}
                          disabled={respondingPairId === request.pairId}
                          className="rounded-md bg-rose-600 px-3 py-2 text-xs font-semibold text-white hover:bg-rose-500 disabled:opacity-60"
                        >
                          Decline
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </article>
          </section>
        ) : null}

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Your week</p>
            <p className="mt-1 text-lg font-semibold text-white">Discipline Score: {data.mySummary.disciplineScore}</p>
            <div className="mt-3 space-y-1 text-sm text-slate-300">
              <p>Trades: {data.mySummary.tradeCount}</p>
              <p>Win Rate: {(analyticsWinRate ?? data.mySummary.winRate).toFixed(1)}%</p>
              <p>Rule Breaks: {data.mySummary.ruleBreaks}</p>
              <p>Checklist Completion: {(data.mySummary.checklistCompletionRate * 100).toFixed(1)}%</p>
            </div>
          </article>

          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">{partnerName}'s week</p>
            {data.accountabilityMode && !data.partner ? (
              <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-slate-200">No accepted partner yet</p>
                <p className="mt-1 text-sm text-slate-400">Send or respond to a request to start weekly accountability.</p>
              </div>
            ) : !data.accountabilityMode ? (
              <div className="mt-3 rounded-lg border border-slate-700/70 bg-slate-950/60 p-4">
                <p className="text-sm font-medium text-slate-200">No accountability partner yet</p>
                <p className="mt-1 text-sm text-slate-400">Enable Accountability Mode in Settings to get matched with a partner.</p>
                <Link
                  href="/settings"
                  className="mt-3 inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  Enable Accountability Mode
                </Link>
              </div>
            ) : data.partnerSummary ? (
              <>
                <p className="mt-1 text-lg font-semibold text-white">Discipline Score: {data.partnerSummary.disciplineScore}</p>
                <div className="mt-3 space-y-1 text-sm text-slate-300">
                  <p>Trades: {data.partnerSummary.tradeCount}</p>
                  <p>Win Rate: {data.partnerSummary.winRate.toFixed(1)}%</p>
                  <p>Rule Breaks: {data.partnerSummary.ruleBreaks}</p>
                  <p>Checklist Completion: {(data.partnerSummary.checklistCompletionRate * 100).toFixed(1)}%</p>
                </div>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-400">Partner summary is not available yet for this week.</p>
            )}
          </article>
        </section>

        {data.partner && data.pendingReview ? (
          <section className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">Review {partnerName}</h2>
            <p className="mt-1 text-sm text-slate-400">Share constructive weekly feedback.</p>

            <form onSubmit={submitReview} className="mt-4 space-y-4">
              <div>
                <label className="mb-1 block text-sm text-slate-300">What did your partner do well?</label>
                <textarea
                  value={doneWell}
                  onChange={(event) => setDoneWell(event.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">What mistakes did you observe?</label>
                <textarea
                  value={mistakes}
                  onChange={(event) => setMistakes(event.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-300">Suggestions for next week?</label>
                <textarea
                  value={suggestions}
                  onChange={(event) => setSuggestions(event.target.value)}
                  className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100 outline-none focus:border-blue-500"
                  required
                />
              </div>

              {message ? <p className="text-sm text-slate-300">{message}</p> : null}

              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          </section>
        ) : null}

        {message ? <p className="text-sm text-slate-300">{message}</p> : null}

        {!data.pendingReview && data.partner ? (
          <section className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-5">
            <h2 className="text-lg font-semibold text-emerald-100">Review submitted ✅</h2>
            <p className="mt-1 text-sm text-emerald-200/90">Your weekly review for {partnerName} is complete.</p>
          </section>
        ) : null}

        {data.receivedReview ? (
          <section className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-xl font-semibold text-white">Feedback received from partner</h2>
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">What you did well</p>
                <p className="mt-1">{data.receivedReview.doneWell}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Mistakes observed</p>
                <p className="mt-1">{data.receivedReview.mistakes}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Suggestions</p>
                <p className="mt-1">{data.receivedReview.suggestions}</p>
              </div>
            </div>
          </section>
        ) : null}

        <section className="rounded-lg border border-slate-700 bg-slate-900 p-5">
          <h2 className="text-xl font-semibold text-white">Feedback you received last week:</h2>
          {data.lastWeekFeedback ? (
            <div className="mt-4 space-y-3 text-sm text-slate-200">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">What you did well</p>
                <p className="mt-1">{data.lastWeekFeedback.doneWell}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Mistakes observed</p>
                <p className="mt-1">{data.lastWeekFeedback.mistakes}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Suggestions</p>
                <p className="mt-1">{data.lastWeekFeedback.suggestions}</p>
              </div>
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No feedback received last week.</p>
          )}

          <h3 className="mt-6 text-lg font-semibold text-white">Review history</h3>
          {data.reviewHistory.length > 0 ? (
            <div className="mt-3 space-y-3">
              {data.reviewHistory.map((review) => (
                <article key={review.id} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4 text-sm text-slate-200">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Week of {new Date(review.pair.weekStart).toLocaleDateString()} • {review.reviewer.displayName || "Partner"}
                  </p>
                  <p className="mt-2"><span className="text-slate-400">Did well:</span> {review.doneWell}</p>
                  <p className="mt-1"><span className="text-slate-400">Mistakes:</span> {review.mistakes}</p>
                  <p className="mt-1"><span className="text-slate-400">Suggestions:</span> {review.suggestions}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-400">No review history yet.</p>
          )}
        </section>
      </div>
    </main>
  );
}
