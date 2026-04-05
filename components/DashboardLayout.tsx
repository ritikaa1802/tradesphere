"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileSidebarOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = originalOverflow; };
  }, [mobileSidebarOpen]);

  return (
    <div className="min-h-screen theme-bg-app text-[var(--text-primary)]">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        collapsed={sidebarCollapsed}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[1px] md:hidden"
        />
      ) : null}

      <main
        className={`min-h-screen theme-bg-app transition-[padding] duration-300 ${
          sidebarCollapsed ? "md:pl-[84px]" : "md:pl-[220px]"
        }`}
      >
        <TopBar
          onOpenMobileMenu={() => setMobileSidebarOpen(true)}
          onToggleSidebar={() => setSidebarCollapsed((v) => !v)}
          sidebarCollapsed={sidebarCollapsed}
        />

        <div className="pt-14">
          <div className="mx-auto w-full max-w-[1600px] overflow-x-hidden p-2 md:p-4 lg:p-6">
            <div key={pathname} className="page-transition">
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
