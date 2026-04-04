"use client";

import { SessionProvider } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </SessionProvider>
  );
}
