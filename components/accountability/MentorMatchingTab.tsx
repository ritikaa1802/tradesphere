"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ProGate from "@/components/ProGate";

type Mentor = {
  id: string;
  mentorId: string;
  displayName: string;
  experienceLevel: "Intermediate" | "Advanced";
  tradingStyle: "Intraday" | "Swing" | "Long-term";
  bio: string;
  currentMentees: number;
  maxMentees: number;
  isAvailable: boolean;
  disciplineScore: number;
  winRate: number;
};

type MentorProfile = {
  id: string;
  userId: string;
  experienceLevel: "Intermediate" | "Advanced";
  tradingStyle: "Intraday" | "Swing" | "Long-term";
  bio: string;
  maxMentees: number;
  isAvailable: boolean;
};

type ViewerEligibility = {
  tradeCount: number;
  disciplineScore: number;
  canRegister: boolean;
  missing: string[];
};

type RequestsPayload = {
  viewer: {
    id: string;
    displayName: string;
    isMentor: boolean;
    isPro: boolean;
    eligibility: ViewerEligibility;
    mentorProfile: MentorProfile | null;
  };
  mentee: {
    pendingRequest: {
      id: string;
      status: string;
      createdAt: string;
      mentor: {
        id: string;
        displayName: string;
        profile: MentorProfile | null;
      };
    } | null;
    activeMentorship: {
      id: string;
      status: string;
      startedAt: string | null;
      mentor: {
        id: string;
        displayName: string;
        profile: MentorProfile | null;
      };
    } | null;
  };
  mentor: {
    incomingRequests: Array<{
      id: string;
      createdAt: string;
      mentee: {
        id: string;
        displayName: string;
        disciplineScore: number;
        recentTrades: number;
        winRate: number;
      };
    }>;
    activeMentees: Array<{
      id: string;
      startedAt: string | null;
      mentee: {
        id: string;
        displayName: string;
        disciplineScore: number;
        recentTrades: number;
        winRate: number;
      };
    }>;
  };
};

type FeedbackItem = {
  id: string;
  weekNumber: number;
  whatWentWell: string;
  areasToImprove: string;
  focusNextWeek: string;
  createdAt: string;
  mentorship: {
    mentor: {
      id: string;
      displayName: string | null;
    };
  };
};

type FeedbackPayload = {
  feedback: FeedbackItem[];
  isPro: boolean;
  totalFeedbackCount: number;
  proLocked: boolean;
};

type FeedbackFormState = {
  weekNumber: number;
  whatWentWell: string;
  areasToImprove: string;
  focusNextWeek: string;
};

const EXPERIENCE_FILTERS = ["All", "Intermediate", "Advanced"] as const;
const STYLE_FILTERS = ["All", "Intraday", "Swing", "Long-term"] as const;

function initials(name: string) {
  return (name || "M").charAt(0).toUpperCase();
}

export default function MentorMatchingTab() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [requests, setRequests] = useState<RequestsPayload | null>(null);
  const [feedback, setFeedback] = useState<FeedbackPayload>({ feedback: [], isPro: false, totalFeedbackCount: 0, proLocked: false });

  const [experienceFilter, setExperienceFilter] = useState<(typeof EXPERIENCE_FILTERS)[number]>("All");
  const [styleFilter, setStyleFilter] = useState<(typeof STYLE_FILTERS)[number]>("All");

  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [requestingMentorId, setRequestingMentorId] = useState<string | null>(null);
  const [respondingRequestId, setRespondingRequestId] = useState<string | null>(null);
  const [cancellingRequest, setCancellingRequest] = useState(false);
  const [submittingFeedbackFor, setSubmittingFeedbackFor] = useState<string | null>(null);

  const [registerBio, setRegisterBio] = useState("");
  const [registerExperienceLevel, setRegisterExperienceLevel] = useState<"Intermediate" | "Advanced">("Intermediate");
  const [registerTradingStyle, setRegisterTradingStyle] = useState<"Intraday" | "Swing" | "Long-term">("Intraday");
  const [registerMaxMentees, setRegisterMaxMentees] = useState(2);

  const [feedbackForms, setFeedbackForms] = useState<Record<string, FeedbackFormState>>({});

  const loadMentorData = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const [mentorsRes, requestsRes, feedbackRes] = await Promise.all([
        fetch("/api/mentors", { cache: "no-store" }),
        fetch("/api/mentors/requests", { cache: "no-store" }),
        fetch("/api/mentors/feedback", { cache: "no-store" }),
      ]);

      if (!mentorsRes.ok || !requestsRes.ok || !feedbackRes.ok) {
        throw new Error("Could not load mentor matching data");
      }

      const mentorsPayload = (await mentorsRes.json()) as { mentors: Mentor[] };
      const requestsPayload = (await requestsRes.json()) as RequestsPayload;
      const feedbackPayload = (await feedbackRes.json()) as FeedbackPayload;

      setMentors(mentorsPayload.mentors || []);
      setRequests(requestsPayload);
      setFeedback(feedbackPayload);

      setRegisterMaxMentees(requestsPayload.viewer.isPro ? 3 : 2);
    } catch {
      setMessage("Could not load mentor matching data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMentorData();
  }, [loadMentorData]);

  const filteredMentors = useMemo(() => {
    return mentors.filter((mentor) => {
      const experiencePass = experienceFilter === "All" || mentor.experienceLevel === experienceFilter;
      const stylePass = styleFilter === "All" || mentor.tradingStyle === styleFilter;
      return experiencePass && stylePass;
    });
  }, [mentors, experienceFilter, styleFilter]);

  async function handleRegisterMentor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRegistering(true);
    setMessage("");

    try {
      const response = await fetch("/api/mentors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: registerBio,
          experienceLevel: registerExperienceLevel,
          tradingStyle: registerTradingStyle,
          maxMentees: registerMaxMentees,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        if (Array.isArray(payload?.missing) && payload.missing.length > 0) {
          setMessage(payload.missing.join(". "));
          return;
        }
        setMessage(payload?.error || "Could not register as mentor");
        return;
      }

      setShowRegisterForm(false);
      setRegisterBio("");
      setMessage("Mentor profile created successfully");
      await loadMentorData();
    } catch {
      setMessage("Could not register as mentor");
    } finally {
      setRegistering(false);
    }
  }

  async function handleRequestMentor(mentorId: string) {
    setRequestingMentorId(mentorId);
    setMessage("");

    try {
      const response = await fetch("/api/mentors/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || "Could not send mentor request");
        return;
      }

      setMessage("Mentor request sent successfully");
      await loadMentorData();
    } catch {
      setMessage("Could not send mentor request");
    } finally {
      setRequestingMentorId(null);
    }
  }

  async function handleCancelRequest() {
    if (!requests?.mentee.pendingRequest?.id) return;

    setCancellingRequest(true);
    setMessage("");

    try {
      const response = await fetch("/api/mentors/request", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorshipId: requests.mentee.pendingRequest.id }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || "Could not cancel mentor request");
        return;
      }

      setMessage("Mentor request canceled");
      await loadMentorData();
    } catch {
      setMessage("Could not cancel mentor request");
    } finally {
      setCancellingRequest(false);
    }
  }

  async function handleRespondRequest(mentorshipId: string, action: "accept" | "decline") {
    setRespondingRequestId(mentorshipId);
    setMessage("");

    try {
      const response = await fetch("/api/mentors/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorshipId, action }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || `Could not ${action} request`);
        return;
      }

      setMessage(action === "accept" ? "Mentorship request accepted" : "Mentorship request declined");
      await loadMentorData();
    } catch {
      setMessage(`Could not ${action} request`);
    } finally {
      setRespondingRequestId(null);
    }
  }

  async function handleSubmitFeedback(event: FormEvent<HTMLFormElement>, mentorshipId: string) {
    event.preventDefault();
    const form = feedbackForms[mentorshipId];
    if (!form) return;

    setSubmittingFeedbackFor(mentorshipId);
    setMessage("");

    try {
      const response = await fetch("/api/mentors/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorshipId, ...form }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setMessage(payload?.error || "Could not submit feedback");
        return;
      }

      setMessage("Feedback submitted");
      setFeedbackForms((prev) => ({
        ...prev,
        [mentorshipId]: {
          weekNumber: form.weekNumber + 1,
          whatWentWell: "",
          areasToImprove: "",
          focusNextWeek: "",
        },
      }));
      await loadMentorData();
    } catch {
      setMessage("Could not submit feedback");
    } finally {
      setSubmittingFeedbackFor(null);
    }
  }

  function getFeedbackForm(mentorshipId: string): FeedbackFormState {
    return (
      feedbackForms[mentorshipId] || {
        weekNumber: 1,
        whatWentWell: "",
        areasToImprove: "",
        focusNextWeek: "",
      }
    );
  }

  function updateFeedbackForm(mentorshipId: string, patch: Partial<FeedbackFormState>) {
    const current = getFeedbackForm(mentorshipId);
    setFeedbackForms((prev) => ({
      ...prev,
      [mentorshipId]: {
        ...current,
        ...patch,
      },
    }));
  }

  if (loading) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#9ca3af]">Loading mentor matching...</section>;
  }

  if (!requests) {
    return <section className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-200">Could not load mentor matching data.</section>;
  }

  const isMentor = requests.viewer.isMentor;
  const pendingRequest = requests.mentee.pendingRequest;
  const activeMentorship = requests.mentee.activeMentorship;
  const eligibility = requests.viewer.eligibility;

  return (
    <section className="space-y-4">
      {message ? <p className="text-sm text-slate-300">{message}</p> : null}

      {!isMentor && !pendingRequest && !activeMentorship ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Find a Mentor</h2>
            <p className="mt-1 text-sm text-slate-400">Browse available mentors and send a request.</p>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <select
                value={styleFilter}
                onChange={(event) => setStyleFilter(event.target.value as (typeof STYLE_FILTERS)[number])}
                className="rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100"
              >
                {STYLE_FILTERS.map((style) => (
                  <option key={style} value={style}>{style === "All" ? "All Trading Styles" : style}</option>
                ))}
              </select>

              <select
                value={experienceFilter}
                onChange={(event) => setExperienceFilter(event.target.value as (typeof EXPERIENCE_FILTERS)[number])}
                className="rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100"
              >
                {EXPERIENCE_FILTERS.map((level) => (
                  <option key={level} value={level}>{level === "All" ? "All Experience Levels" : level}</option>
                ))}
              </select>
            </div>

            {filteredMentors.length === 0 ? (
              <div className="mt-4 rounded-lg border border-slate-700 bg-[#0b1220] p-4 text-sm text-slate-300">
                No mentors available right now. Try adjusting filters or check back later.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {filteredMentors.map((mentor) => {
                  const slotsAvailable = Math.max(0, mentor.maxMentees - mentor.currentMentees);
                  const isDisabled = !mentor.isAvailable || slotsAvailable <= 0;

                  return (
                    <article key={mentor.id} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                              {initials(mentor.displayName)}
                            </div>
                            <p className="truncate text-sm font-semibold text-white">{mentor.displayName}</p>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-medium text-emerald-200">{mentor.experienceLevel}</span>
                            <span className="rounded-full bg-blue-500/15 px-2 py-0.5 text-xs font-medium text-blue-200">{mentor.tradingStyle}</span>
                          </div>

                          <p className="mt-2 text-sm text-slate-300">{mentor.bio}</p>
                          <p className="mt-2 text-xs text-slate-400">Win rate: {mentor.winRate.toFixed(1)}% • Discipline score: {mentor.disciplineScore}</p>
                          <p className="mt-1 text-xs text-slate-400">{slotsAvailable}/{mentor.maxMentees} mentee slots available</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRequestMentor(mentor.mentorId)}
                          disabled={isDisabled || requestingMentorId === mentor.mentorId}
                          className="shrink-0 rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {requestingMentorId === mentor.mentorId ? "Requesting..." : "Request Mentor"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </article>

          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Become a Mentor</h2>
            <p className="mt-1 text-sm text-slate-400">Mentors guide traders with weekly behavioral feedback and discipline coaching.</p>

            <div className="mt-4 rounded-lg border border-slate-700 bg-[#0b1220] p-4 text-sm text-slate-300">
              <p className="font-semibold text-white">Requirements</p>
              <p className="mt-1">Intermediate or Advanced level</p>
              <p>Minimum 20 completed trades</p>
              <p>Discipline score above 60</p>
            </div>

            {!eligibility.canRegister ? (
              <div className="mt-3 rounded-lg border border-amber-500/35 bg-amber-500/10 p-3 text-sm text-amber-100">
                {eligibility.missing.map((missing) => (
                  <p key={missing}>{missing}</p>
                ))}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setShowRegisterForm((value) => !value)}
              className="mt-4 rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              {showRegisterForm ? "Hide Registration Form" : "Register as Mentor"}
            </button>

            {showRegisterForm ? (
              <form onSubmit={handleRegisterMentor} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Bio (max 200 chars)</label>
                  <textarea
                    value={registerBio}
                    onChange={(event) => setRegisterBio(event.target.value.slice(0, 200))}
                    maxLength={200}
                    className="h-24 w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100"
                    required
                  />
                  <p className="mt-1 text-xs text-slate-400">{registerBio.length}/200</p>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Experience level</label>
                  <select
                    value={registerExperienceLevel}
                    onChange={(event) => setRegisterExperienceLevel(event.target.value as "Intermediate" | "Advanced")}
                    className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Trading style</label>
                  <select
                    value={registerTradingStyle}
                    onChange={(event) => setRegisterTradingStyle(event.target.value as "Intraday" | "Swing" | "Long-term")}
                    className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100"
                  >
                    <option value="Intraday">Intraday</option>
                    <option value="Swing">Swing</option>
                    <option value="Long-term">Long-term</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Max mentees (1-5)</label>
                  <select
                    value={registerMaxMentees}
                    onChange={(event) => setRegisterMaxMentees(Number(event.target.value))}
                    className="w-full rounded-lg border border-slate-700 bg-[#0b1220] px-3 py-2 text-sm text-slate-100"
                  >
                    <option value={1}>1</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5</option>
                  </select>
                  {!requests.viewer.isPro ? (
                    <ProGate className="mt-2">
                      <div className="rounded-md border border-slate-700 bg-[#0b1220] p-2 text-xs text-slate-300">
                        3-5 mentees capacity is available on Pro only.
                      </div>
                    </ProGate>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={registering}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                >
                  {registering ? "Submitting..." : "Submit"}
                </button>
              </form>
            ) : null}
          </article>
        </div>
      ) : null}

      {!isMentor && pendingRequest ? (
        <article className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-5">
          <h2 className="text-lg font-semibold text-amber-100">Mentor request sent to {pendingRequest.mentor.displayName} ⏳</h2>
          <p className="mt-1 text-sm text-amber-200/90">Waiting for mentor to accept...</p>

          <div className="mt-3 rounded-lg border border-amber-300/40 bg-black/20 p-3 text-sm text-amber-100">
            <p className="font-semibold">Mentor profile</p>
            <p className="mt-1">Experience: {pendingRequest.mentor.profile?.experienceLevel || "-"}</p>
            <p>Trading style: {pendingRequest.mentor.profile?.tradingStyle || "-"}</p>
            <p className="mt-1">{pendingRequest.mentor.profile?.bio || "No bio available."}</p>
          </div>

          <button
            type="button"
            onClick={handleCancelRequest}
            disabled={cancellingRequest}
            className="mt-4 rounded-md border border-amber-300/50 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20 disabled:opacity-60"
          >
            {cancellingRequest ? "Canceling..." : "Cancel request"}
          </button>
        </article>
      ) : null}

      {!isMentor && activeMentorship ? (
        <article className="space-y-4 rounded-lg border border-slate-700 bg-slate-900 p-5">
          <div>
            <h2 className="text-lg font-semibold text-white">Your Mentor: {activeMentorship.mentor.displayName}</h2>
            <div className="mt-2 rounded-lg border border-slate-700 bg-[#0b1220] p-3 text-sm text-slate-300">
              <p>Experience: {activeMentorship.mentor.profile?.experienceLevel || "-"}</p>
              <p>Trading style: {activeMentorship.mentor.profile?.tradingStyle || "-"}</p>
              <p className="mt-1">{activeMentorship.mentor.profile?.bio || "No bio available."}</p>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-white">Weekly feedback timeline</h3>
            {feedback.feedback.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No feedback yet this week.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {feedback.feedback.map((item) => (
                  <article key={item.id} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4 text-sm text-slate-200">
                    <p className="text-xs uppercase tracking-wide text-slate-400">Week {item.weekNumber}</p>
                    <p className="mt-2 text-emerald-200"><span className="text-emerald-300 font-semibold">What went well:</span> {item.whatWentWell}</p>
                    <p className="mt-1 text-amber-200"><span className="text-amber-300 font-semibold">Areas to improve:</span> {item.areasToImprove}</p>
                    <p className="mt-1 text-blue-200"><span className="text-blue-300 font-semibold">Focus next week:</span> {item.focusNextWeek}</p>
                  </article>
                ))}
              </div>
            )}

            {feedback.proLocked ? (
              <div className="mt-3">
                <ProGate>
                  <div className="rounded-lg border border-slate-700 bg-[#0b1220] p-3 text-sm text-slate-300">
                    Feedback history beyond 4 weeks is Pro only.
                  </div>
                </ProGate>
              </div>
            ) : null}
          </div>

          <div className="rounded-lg border border-slate-700 bg-[#0b1220] p-4">
            <p className="text-sm text-slate-200">Ask your mentor a question</p>
            <Link
              href={`/ai-coach?mentor=${encodeURIComponent(activeMentorship.mentor.displayName)}`}
              className="mt-2 inline-flex rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Open AI Coach with mentor context
            </Link>
          </div>
        </article>
      ) : null}

      {isMentor ? (
        <div className="space-y-4">
          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Your Mentees</h2>

            {requests.mentor.activeMentees.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No active mentees yet.</p>
            ) : (
              <div className="mt-4 space-y-4">
                {requests.mentor.activeMentees.map((item) => {
                  const form = getFeedbackForm(item.id);

                  return (
                    <article key={item.id} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.mentee.displayName}</p>
                          <p className="mt-1 text-xs text-slate-400">Discipline: {item.mentee.disciplineScore} • Recent trades: {item.mentee.recentTrades} • Win rate: {item.mentee.winRate.toFixed(1)}%</p>
                        </div>
                      </div>

                      <form className="mt-3 space-y-3" onSubmit={(event) => handleSubmitFeedback(event, item.id)}>
                        <label className="block text-xs text-slate-300">
                          Week Number
                          <input
                            type="number"
                            min={1}
                            value={form.weekNumber}
                            onChange={(event) => updateFeedbackForm(item.id, { weekNumber: Number(event.target.value) })}
                            className="mt-1 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                            required
                          />
                        </label>

                        <label className="block text-xs text-slate-300">
                          What went well?
                          <textarea
                            value={form.whatWentWell}
                            onChange={(event) => updateFeedbackForm(item.id, { whatWentWell: event.target.value })}
                            className="mt-1 h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                            required
                          />
                        </label>

                        <label className="block text-xs text-slate-300">
                          Areas to improve?
                          <textarea
                            value={form.areasToImprove}
                            onChange={(event) => updateFeedbackForm(item.id, { areasToImprove: event.target.value })}
                            className="mt-1 h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                            required
                          />
                        </label>

                        <label className="block text-xs text-slate-300">
                          Focus for next week?
                          <textarea
                            value={form.focusNextWeek}
                            onChange={(event) => updateFeedbackForm(item.id, { focusNextWeek: event.target.value })}
                            className="mt-1 h-20 w-full rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                            required
                          />
                        </label>

                        <button
                          type="submit"
                          disabled={submittingFeedbackFor === item.id}
                          className="rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
                        >
                          {submittingFeedbackFor === item.id ? "Submitting..." : "Submit Feedback"}
                        </button>
                      </form>
                    </article>
                  );
                })}
              </div>
            )}
          </article>

          <article className="rounded-lg border border-slate-700 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Incoming mentee requests</h2>

            {requests.mentor.incomingRequests.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">No incoming requests.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {requests.mentor.incomingRequests.map((request) => (
                  <article key={request.id} className="rounded-lg border border-slate-700 bg-[#0b1220] p-4">
                    <p className="text-sm font-semibold text-white">{request.mentee.displayName}</p>
                    <p className="mt-1 text-xs text-slate-400">Discipline: {request.mentee.disciplineScore} • Recent trades: {request.mentee.recentTrades} • Win rate: {request.mentee.winRate.toFixed(1)}%</p>

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(request.id, "accept")}
                        disabled={respondingRequestId === request.id}
                        className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRespondRequest(request.id, "decline")}
                        disabled={respondingRequestId === request.id}
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
        </div>
      ) : null}
    </section>
  );
}
