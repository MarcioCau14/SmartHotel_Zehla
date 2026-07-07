import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const PUBLIC_API_PREFIXES = ["/api/auth", "/api/webhook", "/api/health", "/api/readiness"];

export default withAuth(
  function middleware(req) {
    // Ignorar rotas publicas (next-auth, webhooks, saude)
    const pathname = req.nextUrl.pathname;
    if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      return NextResponse.next();
    }

    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/zcc-login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Injetar o tenantId no header
    const requestHeaders = new Headers(req.headers);
    if (token.tenantId) {
      requestHeaders.set("x-tenant-id", token.tenantId as string);
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      async authorized() {
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/zcc/:path*", "/api/:path*"],
};
