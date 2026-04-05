"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useSession } from "next-auth/react";

export default function ProGate({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className={`animate-pulse rounded-xl border border-[#1a2744] bg-[#0d1421] p-4 ${className}`} />;
  }

  if (!session?.user?.isPro) {
    return (
      <div className={`relative overflow-hidden rounded-xl border border-amber-500/35 bg-[#0d1421] ${className}`}>
        <div className="pointer-events-none blur-[2px] opacity-35">{children}</div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#060b14]/75 p-5 text-center">
          <Lock size={18} className="text-amber-400" />
          <p className="text-sm font-semibold text-white">Pro Feature - Upgrade to unlock</p>
          <Link href="/pricing" className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-black hover:bg-amber-400">
            View Pro Plan
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
