import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,https://smarthotelzehla.vercel.app,https://zehla.com.br').split(',').map(s => s.trim());

function isOriginAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*');
}

function addCorsHeaders(response: NextResponse, origin: string | null): void {
  if (!origin || !isOriginAllowed(origin)) return;
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token, X-Tenant-Id, X-Api-Key');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Max-Age', '86400');
  response.headers.set('Vary', 'Origin');
}

/**
 * ZEHLA ARCHITECTURAL MIDDLEWARE
 * Responsável pelo isolamento absoluto entre ZCC (Interno) e Dashboard (Cliente).
 */
export function middleware(request: NextRequest) : void {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // CORS preflight para API routes
  if (pathname.startsWith('/api') && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    addCorsHeaders(response, origin);
    return response;
  }

  // CORS headers para API responses
  if (pathname.startsWith('/api')) {
    const response = NextResponse.next();
    addCorsHeaders(response, origin);
    return response;
  }
  
  // 1. Obter o token de sessão dos cookies (padrão NextAuth ou custom)
  const token = request.cookies.get('next-auth.session-token')?.value || 
                request.cookies.get('__Secure-next-auth.session-token')?.value;

  // 2. Definir rotas protegidas
  const isZccRoute = pathname.startsWith('/zcc');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  if ((isZccRoute || isDashboardRoute) && !token) {
    const loginUrl = isZccRoute ? '/zcc-login' : '/login';
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/zcc/:path*',
    '/dashboard/:path*',
    '/api/:path*',
  ],
};
