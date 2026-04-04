"use client";

import { SessionProvider } from "next-auth/react";
import Navbar from "@/components/Navbar";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Navbar />
      <main className="pt-24">{children}</main>
    </SessionProvider>
  );
}
