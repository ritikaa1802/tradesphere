"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SettingsResponse {
  showOnLeaderboard: boolean;
  displayName: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Failed to load settings");
        }

        const data = (await response.json()) as SettingsResponse;
        if (mounted) {
          setShowOnLeaderboard(data.showOnLeaderboard);
          setDisplayName(data.displayName || "");
        }
      } catch {
        if (mounted) {
          setMessage("Unable to load settings");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showOnLeaderboard,
          displayName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      setMessage("Settings saved");
    } catch {
      setMessage("Could not save settings");
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmReset() {
    setResetting(true);
    setMessage("");

    try {
      const response = await fetch("/api/portfolio/reset", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data?.error || "Could not reset portfolio");
        return;
      }

      router.push("/dashboard");
    } catch {
      setMessage("Could not reset portfolio");
    } finally {
      setResetting(false);
      setShowResetModal(false);
    }
  }

  if (loading) {
    return <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 text-[#9ca3af]">Loading settings...</section>;
  }

  return (
    <section className="rounded-xl border border-[#1a2744] bg-[#0d1421] p-4">
      <h2 className="text-lg font-semibold text-white">Settings</h2>
      <p className="mt-1 text-sm text-[#9ca3af]">Manage your leaderboard profile.</p>

      <form onSubmit={onSave} className="mt-4 space-y-4">
        <label className="flex items-center justify-between rounded-lg border border-[#1a2744] bg-[#0f1929] px-3 py-2">
          <span className="text-sm text-white">Show me on leaderboard</span>
          <input
            type="checkbox"
            checked={showOnLeaderboard}
            onChange={(event) => setShowOnLeaderboard(event.target.checked)}
            className="h-4 w-4 accent-[#3b82f6]"
          />
        </label>

        <div>
          <label className="mb-1 block text-sm text-[#9ca3af]">Display name</label>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={32}
            placeholder="Enter public name"
            className="w-full rounded-lg border border-[#1a2744] bg-[#0f1929] px-3 py-2 text-sm text-white outline-none focus:border-[#3b82f6]"
          />
        </div>

        {message ? <p className="text-sm text-[#9ca3af]">{message}</p> : null}

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#1d4ed8] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#2563eb] disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={() => setShowResetModal(true)}
          className="ml-2 rounded-lg bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#dc2626]"
        >
          Reset Portfolio
        </button>
      </form>

      {showResetModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl border border-[#1a2744] bg-[#0d1421] p-5">
            <h3 className="text-lg font-semibold text-white">Reset Portfolio</h3>
            <p className="mt-2 text-sm text-[#9ca3af]">
              This will delete all your trades and reset balance to ₹1,00,000. Are you sure?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-lg bg-[#1a2744] px-4 py-2 text-sm font-semibold text-white hover:bg-[#223150]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirmReset}
                disabled={resetting}
                className="rounded-lg bg-[#b91c1c] px-4 py-2 text-sm font-semibold text-white hover:bg-[#dc2626] disabled:opacity-60"
              >
                {resetting ? "Resetting..." : "Yes, Reset"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
