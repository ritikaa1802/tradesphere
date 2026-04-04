"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#060b14] text-white">
      <Sidebar />
      <TopBar />
      <main className="ml-[220px] mt-14 h-[calc(100vh-56px)] overflow-y-auto bg-[#060b14] p-4 lg:p-5">
        <div key={pathname} className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}
