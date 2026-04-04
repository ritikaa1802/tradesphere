import type { Metadata } from "next";
import "./globals.css";
import RootProviders from "@/components/RootProviders";

export const metadata: Metadata = {
  title: "TradeSphere",
  description: "Paper trading platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0f1e] text-slate-100 min-h-screen">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
