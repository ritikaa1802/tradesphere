"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideAppShell = pathname === "/login" || pathname === "/signup";

  return (
    <SessionProvider>
      {hideAppShell ? children : <DashboardLayout>{children}</DashboardLayout>}
    </SessionProvider>
  );
}
