import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/zcc-login");

    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
      return null;
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
    
    // Injetar o tenantId no header para que o backend possa ler se necessário
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
        // Isso permite que o middleware acima gerencie a lógica de redirecionamento
        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/zcc/:path*",
    // Protege todas as APIs exceto: rotas do next-auth (/api/auth), webhooks
    // publicos (Meta, Stripe, etc.) e endpoints de saude (health/readiness)
    "/api/((?!auth|webhook|health|readiness).)*:path*",
  ],
};
