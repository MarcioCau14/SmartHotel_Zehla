// ==============================================================================  
// ZEHLA SmartHotel — Next.js Middleware (Zero Trust V2 — SecOps Hardened)
// ==============================================================================
// SECURITY CHANGES:
// - CSP tightened: removed unsafe-eval, restricted wss:// to known domains
// - API route auth enforcement in production
// - Debug routes blocked in production
// - Strict-Transport-Security added
// - Removed BYPASS middleware auth from production path
// ==============================================================================

import { NextRequest, NextResponse } from 'next/server';

const SKIP_LOG_PATHS = ['/api/health', '/api/readiness', '/_next/', '/favicon.ico', '/logo.svg', '/sounds/'];

const PROTECTED_PAGE_PATHS = ['/ddc', '/zcc', '/dashboard', '/config', '/tenants', '/campaigns', '/leads', '/targets', '/agents', '/roi', '/swipe-templates'];

/** API routes that require auth in production */
const PROTECTED_API_PREFIXES = [
  '/api/leads', '/api/targets', '/api/campaigns', '/api/swipe-templates',
  '/api/roi', '/api/hunt', '/api/export', '/api/bulk-whatsapp',
  '/api/zcc', '/api/brain', '/api/agents', '/api/agent-logs',
  '/api/tenants', '/api/config', '/api/router', '/api/feedback',
  '/api/v1', '/api/channel-manager', '/api/dashboard',
  '/api/monitoring', '/api/security', '/api/knowledge',
  '/api/ddc',
];

/** API routes completely blocked in production */
const BLOCKED_API_PREFIXES = [
  '/api/debug-agent', '/api/proxy', '/api/diagnose',
];

function shouldSkipLog(pathname: string): boolean {  
  return SKIP_LOG_PATHS.some((p) => pathname.startsWith(p)) || pathname.startsWith('/_next');  
}

function isProtectedPage(pathname: string): boolean {  
  return PROTECTED_PAGE_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));  
}

function isProtectedApi(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some(p => pathname.startsWith(p));
}

function isBlockedApi(pathname: string): boolean {
  return BLOCKED_API_PREFIXES.some(p => pathname.startsWith(p));
}

function isPublicApi(pathname: string): boolean {
  const publicRoutes = [
    '/api/health',
    '/api/auth',
    '/api/webhook-whatsapp',
    '/api/checkout/webhook',
    '/api/integrations/sync',
  ];
  return publicRoutes.some(p => pathname.startsWith(p));
}

export function middleware(request: NextRequest) {  
  const { pathname } = request.nextUrl;  
  const response = NextResponse.next();

  // ── Security Headers (all responses) ──
  response.headers.set('X-Content-Type-Options', 'nosniff');  
  response.headers.set('X-XSS-Protection', '1; mode=block');  
  response.headers.set('X-Frame-Options', 'DENY');  
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');  
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(self), geolocation=(), payment=()');
  response.headers.set('X-Security-Shield', 'zero-trust-v2');

  // ── HSTS (production only) ──
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // ── Content Security Policy (production only — hardened) ──
  if (process.env.NODE_ENV === 'production') {  
    response.headers.set('Content-Security-Policy', [  
      "default-src 'self'",  
      "script-src 'self' 'unsafe-inline'",  // unsafe-eval REMOVED
      "style-src 'self' 'unsafe-inline'",  
      "img-src 'self' data: blob: https://*.mercadopago.com https://*.cloudinary.com",
      "font-src 'self' data:",  
      // wss://* REMOVED — restricted to known domains
      "connect-src 'self' https://*.mercadopago.com wss://smart-hotel-zehla.vercel.app https://*.railway.app",
      "frame-ancestors 'none'",  
      "base-uri 'self'",
      "form-action 'self' https://*.mercadopago.com",
    ].join('; '));  
  }

  // ── Request ID ──
  const requestId = request.headers.get('x-request-id') || request.headers.get('x-vercel-id') || `mid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;  
  response.headers.set('X-Request-ID', requestId);

  // ── Request Logging (skip noisy paths) ──
  if (!shouldSkipLog(pathname)) {  
    const isApi = pathname.startsWith('/api/');  
    console.log(JSON.stringify({  
      timestamp: new Date().toISOString(),  
      type: isApi ? 'api-request' : 'page-request',  
      method: request.method, path: pathname, requestId,  
      userAgent: request.headers.get('user-agent')?.slice(0, 100),  
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown',  
    }));  
  }

  // ═══════════════════════════════════════════════════════════════
  // PRODUCTION SECURITY ENFORCEMENT
  // ═══════════════════════════════════════════════════════════════

  if (process.env.NODE_ENV === 'production') {
    // ── BLOCK debug routes in production ──
    if (isBlockedApi(pathname)) {
      return NextResponse.json(
        { error: 'ROUTE_DISABLED_IN_PRODUCTION', requestId },
        { status: 404 }
      );
    }

    // ── PROTECT API routes in production ──
    if (pathname.startsWith('/api/') && !isPublicApi(pathname) && isProtectedApi(pathname)) {
      const sessionCookie = request.cookies.get('next-auth.session-token')
        || request.cookies.get('__Secure-next-auth.session-token');
      const authHeader = request.headers.get('authorization');
      const bearerToken = request.headers.get('x-api-key');

      // Accept: session cookie OR Bearer token OR API key
      if (!sessionCookie && !authHeader && !bearerToken) {
        return NextResponse.json(
          { error: 'AUTH_REQUIRED', message: 'Autenticação necessária para esta rota.', requestId },
          { status: 401 }
        );
      }
    }

    // ── PROTECT page routes ──
    if (isProtectedPage(pathname)) {
      const sessionCookie = request.cookies.get('next-auth.session-token')
        || request.cookies.get('__Secure-next-auth.session-token');
      if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  } else {
    // ── Dev/CI: Respect BYPASS_MIDDLEWARE_AUTH for page routes only ──
    const bypassAuth = process.env.BYPASS_MIDDLEWARE_AUTH === 'true';
    if (!bypassAuth && isProtectedPage(pathname)) {
      const sessionCookie = request.cookies.get('next-auth.session-token')
        || request.cookies.get('__Secure-next-auth.session-token');
      if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  return response;  
}

export const config = {  
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)'],  
};