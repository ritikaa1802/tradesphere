"use client";

import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootProviders({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideAppShell = pathname === "/" || pathname === "/login" || pathname === "/signup" || pathname === "/verify-otp";

  return (
    <ThemeProvider>
      <SessionProvider>
        {hideAppShell ? children : <DashboardLayout>{children}</DashboardLayout>}
      </SessionProvider>
    </ThemeProvider>
  );
}
