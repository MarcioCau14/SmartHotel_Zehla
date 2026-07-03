// ==============================================================================  
// ZEHLA SmartHotel — Next.js Middleware (Fase 6B)  
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

const SKIP_LOG_PATHS = ['/api/health', '/api/readiness', '/_next/', '/favicon.ico', '/logo.svg', '/sounds/'];

const PROTECTED_PATHS = ['/ddc', '/zcc', '/dashboard', '/config', '/tenants', '/campaigns', '/leads', '/targets', '/agents', '/roi', '/swipe-templates'];

function shouldSkipLog(pathname: string): boolean {  
  return SKIP_LOG_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith('/_next');  
}

function isProtectedPath(pathname: string): boolean {  
  return PROTECTED_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));  
}

export function middleware(request: NextRequest) {  
  const { pathname } = request.nextUrl;  
  const response = NextResponse.next();

  // Security Headers  
  response.headers.set('X-Content-Type-Options', 'nosniff');  
  response.headers.set('X-XSS-Protection', '1; mode=block');  
  response.headers.set('X-Frame-Options', 'DENY');  
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');  
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=()');

  if (process.env.NODE_ENV === 'production') {  
    response.headers.set('Content-Security-Policy', [  
      "default-src 'self'",  
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  
      "style-src 'self' 'unsafe-inline'",  
      "img-src 'self' data: blob: https://*.mercadopago.com",  
      "font-src 'self' data:",  
      "connect-src 'self' https://*.mercadopago.com wss://* https://*.railway.app",  
      "frame-ancestors 'none'",  
    ].join('; '));  
  }

  // Request ID  
  const requestId = request.headers.get('x-request-id') || request.headers.get('x-vercel-id') || `mid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;  
  response.headers.set('X-Request-ID', requestId);

  // Request Logging  
  if (!shouldSkipLog(pathname)) {  
    const isApi = pathname.startsWith('/api/');  
    console.log(JSON.stringify({  
      timestamp: new Date().toISOString(),  
      type: isApi ? 'api-request' : 'page-request',  
      method: request.method, path: pathname, requestId,  
      userAgent: request.headers.get('user-agent')?.slice(0, 100),  
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',  
    }));  
  }

  // Auth Check for Protected Routes  
  if (isProtectedPath(pathname) && !pathname.startsWith('/api/')) {  
    if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
      return response;
    }
    const sessionCookie = request.cookies.get('next-auth.session-token') || request.cookies.get('__Secure-next-auth.session-token');  
    if (!sessionCookie) {  
      const loginUrl = new URL('/login', request.url);  
      loginUrl.searchParams.set('callbackUrl', pathname);  
      return NextResponse.redirect(loginUrl);  
    }  
  }

  return response;  
}

export const config = {  
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)'],  
};  
