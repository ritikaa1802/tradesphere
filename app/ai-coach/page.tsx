"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type AiReport = {
  mistakes: string[];
  bestTrade: string;
  tip: string;
  personalityTag: string;
};

type ChatMessage = {
  role: "user" | "assistant";
  text: string;
};

export default function AiCoachPage() {
  const [report, setReport] = useState<AiReport | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [question, setQuestion] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function generateReport() {
    setLoadingReport(true);
    setError("");

    try {
      const res = await fetch("/api/ai/report", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const details = data.details ? ` (${data.details})` : "";
        throw new Error(`${data.error || "Failed to generate report"}${details}`);
      }
      setReport(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingReport(false);
    }
  }

  async function sendQuestion(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!question.trim()) return;

    const newMsg: ChatMessage = { role: "user", text: question.trim() };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        const details = data.details ? ` (${data.details})` : "";
        throw new Error(`${data.error || "Chat request failed"}${details}`);
      }

      setChatMessages((prev) => [...prev, { role: "assistant", text: data.answer || "No response" }]);
      setQuestion("");
    } catch (err) {
      setChatMessages((prev) => [...prev, { role: "assistant", text: `Error: Could not get response from AI coach. ${ (err as Error).message }` }]);
    } finally {
      setChatLoading(false);
    }
  }

  function parseMarkdown(markdown: string) {
    if (!markdown) return "";
    const escaped = markdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    const lines = withBold.split("\n");
    let html = "";
    let inList = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("* ")) {
        if (!inList) {
          html += "<ul class='ml-5 list-disc mb-2'>";
          inList = true;
        }
        html += `<li>${trimmed.slice(2).trim()}</li>`;
      } else {
        if (inList) {
          html += "</ul>";
          inList = false;
        }

        if (trimmed === "") {
          html += "<div style='margin:9px 0'></div>";
        } else {
          html += `<p style='margin:0 0 8px'>${trimmed}</p>`;
        }
      }
    }

    if (inList) {
      html += "</ul>";
    }

    return html;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl p-6">
      <div className="w-full">
        <h1 className="mb-4 text-3xl font-bold">AI Coach</h1>

        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={generateReport}
            className="rounded bg-indigo-600 px-5 py-2 font-semibold text-white hover:bg-indigo-500"
            disabled={loadingReport}
          >
            {loadingReport ? "Thinking..." : "Generate My Weekly Report"}
          </button>
          <Link href="/dashboard" className="rounded bg-slate-700 px-4 py-2 text-slate-100 hover:bg-slate-600">
            Back to Dashboard
          </Link>
        </div>

        {error && <p className="mb-4 text-sm text-rose-400">{error}</p>}

        {report && (
          <div className="mb-6 space-y-4 rounded bg-slate-800 p-5">
            <div className="inline-block rounded-lg bg-green-600 px-3 py-1 text-sm font-semibold text-white">
              {report.personalityTag}
            </div>
            <div>
              <h2 className="text-lg font-bold">Top 3 Behavioral Mistakes</h2>
              <ol className="ml-5 list-decimal text-slate-200">
                {report.mistakes.map((m, idx) => (
                  <li key={idx} className="mt-1">{m}</li>
                ))}
              </ol>
            </div>
            <div>
              <h2 className="text-lg font-bold">Best Trade</h2>
              <p>{report.bestTrade}</p>
            </div>
            <div>
              <h2 className="text-lg font-bold">Tip for Next Week</h2>
              <p>{report.tip}</p>
            </div>
          </div>
        )}

        <div className="rounded bg-slate-800 p-5">
          <h2 className="mb-3 text-xl font-bold">Ask a follow-up question</h2>
          <form onSubmit={sendQuestion} className="mb-4 flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded border border-slate-700 bg-slate-900 p-2"
              placeholder="Ask AI Coach about your trades..."
              required
            />
            <button type="submit" className="rounded bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500" disabled={chatLoading}>
              {chatLoading ? "Thinking..." : "Send"}
            </button>
          </form>

          <div className="space-y-3">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`rounded p-3 ${msg.role === "assistant" ? "bg-slate-700" : "bg-slate-600"}`}>
                <p className="text-xs text-slate-400 uppercase">{msg.role}</p>
                {msg.role === "assistant" ? (
                  <div
                    className="mt-1 text-slate-100"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.text) }}
                  />
                ) : (
                  <p className="mt-1 text-slate-100">{msg.text}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}