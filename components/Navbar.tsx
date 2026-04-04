"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Trade", href: "/trade" },
  { label: "History", href: "/history" },
  { label: "TradeMind", href: "/mood" },
  { label: "Mistakes", href: "/mistakes" },
  { label: "Analytics", href: "/analytics" },
  { label: "AI Coach", href: "/ai-coach" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-800 bg-[#0d1324]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/dashboard" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/20">
            TS
          </span>
          <span className="text-white">TradeSphere</span>
        </Link>

        <button
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-200 md:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          <span>{menuOpen ? "Close" : "Menu"}</span>
          <span className="text-blue-400">•</span>
        </button>

        <div className={`w-full md:flex md:w-auto ${menuOpen ? "block" : "hidden"}`}>
          <nav className="flex flex-col gap-2 rounded-3xl border border-slate-800 bg-[#0f1629] p-4 md:flex-row md:items-center md:border-none md:bg-transparent md:p-0">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/10"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <span className="truncate text-sm text-slate-300 md:max-w-xs">
            {session?.user?.email ?? "Guest"}
          </span>
          {session ? (
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-slate-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
