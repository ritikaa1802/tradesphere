"use client";

import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white">
      <Sidebar />
      <TopBar />
      <main className="ml-[240px] mt-14 h-[calc(100vh-56px)] overflow-y-auto bg-[#0a0f1e] p-4 lg:p-5">{children}</main>
    </div>
  );
}
