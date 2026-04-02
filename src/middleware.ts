import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware() {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const p = req.nextUrl.pathname;
        if (p.startsWith("/admin")) return token?.role === "ADMIN";
        if (p.startsWith("/account")) return !!token;
        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
