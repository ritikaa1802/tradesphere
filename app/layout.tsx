import type { Metadata } from "next";
import "./globals.css";
import RootProviders from "@/components/RootProviders";

export const metadata: Metadata = {
  title: "TradeSphere — Trade Smarter. Learn Faster. Lose Less.",
  description:
    "India's only paper trading platform with AI behavioral coaching, emotion tracking, and personalized mistake detection. Trade real NSE/BSE stocks with zero risk.",
  keywords: ["paper trading", "NSE", "BSE", "AI trading", "stock market India", "trading simulator"],
  openGraph: {
    title: "TradeSphere — Trade Smarter. Learn Faster.",
    description: "India's #1 AI paper trading platform for serious traders.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-[#050912] text-slate-100 min-h-screen" suppressHydrationWarning>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
