import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";

const PUBLIC_PATHS = ["/login", "/signup"];

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    if (PUBLIC_PATHS.includes(pathname)) {
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

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
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
  matcher: ["/dashboard", "/trade", "/onboarding", "/history", "/mood", "/mistakes", "/ai-coach", "/api/trade", "/api/trades", "/api/mood", "/api/analytics/mistakes", "/api/ai/report", "/api/ai/chat", "/api/auth/signup"],
};
