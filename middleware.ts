import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/verify-otp"];

export default withAuth(
  async function middleware(req) {
    const { pathname } = req.nextUrl;
    const isPublicChampionApi = pathname === "/api/challenges/monthly-champion";

    if (req.nextauth.token && PUBLIC_PATHS.includes(pathname)) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }

    if (PUBLIC_PATHS.includes(pathname) || isPublicChampionApi) {
      return NextResponse.next();
    }

    if (pathname.startsWith("/api/auth")) {
      return NextResponse.next();
    }

    if (!req.nextauth.token) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await fetch(new URL("/api/challenges/sync-pro", req.url), {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });
    } catch {
      // Best-effort pro-sync check for challenge reward expiry.
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const isPublicChampionApi = req.nextUrl.pathname === "/api/challenges/monthly-champion";
        if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
          return true;
        }
        if (isPublicChampionApi) {
          return true;
        }
        if (req.nextUrl.pathname.startsWith("/api/auth")) {
          return true;
        }
        return Boolean(token);
      },
    },
  }
);

export const config = {
  matcher: ["/", "/login", "/signup", "/verify-otp", "/dashboard", "/trade", "/orders", "/watchlist", "/alerts", "/onboarding", "/history", "/mood", "/mistakes", "/ai-coach", "/leaderboard", "/competitions", "/competitions/:path*", "/challenges", "/pricing", "/settings", "/stock/:path*", "/api/trade", "/api/trades", "/api/orders/:path*", "/api/watchlist/:path*", "/api/alerts/:path*", "/api/mood", "/api/analytics/mistakes", "/api/ai/report", "/api/ai/chat", "/api/auth/signup", "/api/auth/send-otp", "/api/auth/verify-otp", "/api/leaderboard", "/api/competitions", "/api/competitions/:path*", "/api/challenges", "/api/challenges/:path*", "/api/settings", "/api/news", "/api/portfolio", "/api/portfolio/history", "/api/portfolio/reset", "/api/portfolio/sectors", "/api/insights", "/api/email/weekly-report", "/api/export/csv", "/api/pro/upgrade"],
};
