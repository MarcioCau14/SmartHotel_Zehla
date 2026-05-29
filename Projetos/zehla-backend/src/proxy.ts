import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

import { redis } from '@/lib/redis';

import type { NextRequest } from 'next/server';

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,https://smarthotelzehla.vercel.app,https://zehla.com.br').split(',').map(s => s.trim());

const PUBLIC_PATHS = [
  '/connect/',
  '/login',
  '/api/auth/',
  '/api/connect/profile/',
  '/api/connect/analytics/track',
  '/_next/',
  '/favicon.ico',
  '/termos',
  '/privacidade',
  '/teste-gratis',
  '/vendas',
  '/zcc',
  '/zcc-login',
  '/dashboard/upgrade',
];

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

const TENANT_RATE_LIMIT = 100;
const TENANT_WINDOW_SECONDS = 60;

function isOriginAllowed(origin: string): boolean {
  return ALLOWED_ORIGINS.includes(origin) || ALLOWED_ORIGINS.includes('*');
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some(p => pathname.startsWith(p));
}

async function checkTenantRateLimit(tenantId: string, ip: string): Promise<boolean> {
  try {
    const key = `rate_limit_tenant_${tenantId}:${ip}`;
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, TENANT_WINDOW_SECONDS);
    }
    return current <= TENANT_RATE_LIMIT;
  } catch {
    return true;
  }
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

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET!);
const ZCC_PATHS = ['/zcc', '/api/zcc'];
const PROTECTED_ROUTES = ['/dashboard'];
const ADMIN_ONLY_ROUTES = ['/api/admin'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const origin = request.headers.get('origin');

  // CORS preflight
  if (pathname.startsWith('/api') && request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    addCorsHeaders(response, origin);
    return response;
  }

  // CORS enforcement for mutation methods on non-public API routes
  if (origin && pathname.startsWith('/api/') && !isPublicPath(pathname) && MUTATION_METHODS.includes(request.method)) {
    if (!isOriginAllowed(origin)) {
      return NextResponse.json(
        { error: 'Origin not allowed', code: 'CORS_BLOCKED' },
        { status: 403 }
      );
    }
  }

  // BYPASS ZCC AUTH FOR LOCAL DEV — check Host header (nextUrl.hostname reflects bind addr, not request host)
  const host = request.headers.get('host') || '';
  if (host.startsWith('localhost') || host.startsWith('127.0.0.1') || host.startsWith('0.0.0.0')) {
    return NextResponse.next();
  }

  const ip = (request as any).ip ?? request.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown';
  const tenantId = request.headers.get('x-tenant-id') || 'global';

  // 0. Circuit Breaker Automático (Guardian Agent) - Resiliente a falha de conexão
  try {
    const isBlocked = await redis.get(`block:ip:${ip}`);
    if (isBlocked) {
      return NextResponse.json(
        { error: 'Access denied by Guardian Agent' },
        { status: 403 }
      );
    }

    if (tenantId && tenantId !== 'global') {
      const isIsolated = await redis.get(`isolate:tenant:${tenantId}`);
      if (isIsolated) {
        return NextResponse.json(
          { error: 'Tenant under security review' },
          { status: 503 }
        );
      }

      // Multi-tenant rate limiting: isolates rate limits per tenant
      // Prevents one tenant's DDoS from affecting others
      if (!isPublicPath(pathname) && pathname.startsWith('/api/')) {
        const allowed = await checkTenantRateLimit(tenantId, ip);
        if (!allowed) {
          return NextResponse.json(
            { error: 'Tenant rate limit exceeded. Contact support.', code: 'TENANT_RATE_LIMITED' },
            { status: 429 }
          );
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ [Proxy] Redis offline - bypassing security checks for dev stability');
  }


  // 0.1 Proteção Estrita ZCC (SUPER_ADMIN)
  if (ZCC_PATHS.some(p => pathname.startsWith(p)) && pathname !== '/zcc-login') {
    const token = request.cookies.get('__session')?.value 
      ?? request.cookies.get('zehla-token')?.value
      ?? request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/zcc-login', request.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY, { clockTolerance: 60 });
      
      if (payload.role !== 'SUPER_ADMIN') {
        const url = request.nextUrl.clone();
        url.pathname = '/403';
        url.searchParams.set('reason', 'superadmin_required');
        return NextResponse.rewrite(url);
      }

      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-zcc-user-id', payload.sub as string);
      requestHeaders.set('x-zcc-role', payload.role as string);
      requestHeaders.set('x-zcc-tenant-id', payload.tenantId as string);

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    } catch (e) {
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login?reason=token_invalid', request.url));
    }
  }
  
  // 1. Headers de Segurança (ZEHLA Fortress)
  const response = NextResponse.next();
  addCorsHeaders(response, origin);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
  
  // 2. Verificação de Autenticação para Rotas Protegidas
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('zehla-token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      // Se for API, retorna 401
      if (pathname.startsWith('/api')) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
      }
      // Se for página, redireciona para login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // 3. RBAC - Proteção de Rotas Administrativas (ZCC)
    const isAdminRoute = ADMIN_ONLY_ROUTES.some(route => pathname.startsWith(route));
    if (isAdminRoute) {
      // Em produção, decodificaríamos o JWT aqui para checar a role.
      // Por enquanto, permitimos se houver token, mas o backend validará a role.
    }

    // 4. Trial Expiration Guard — redireciona para /dashboard/upgrade se trial expirado
    if (pathname.startsWith('/dashboard') && !pathname.startsWith('/dashboard/upgrade') && !pathname.startsWith('/dashboard/configuracoes')) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY, { clockTolerance: 60 });
        const propertyId = (payload as any).propertyId || (payload as any).tenantId;
        
        if (propertyId) {
          const statusKey = `trial:status:${propertyId}`;
          const cached = await redis.get(statusKey);
          
          let isExpired = false;
          
          if (cached) {
            isExpired = cached === 'expired';
          } else {
            const { prisma } = await import('@/lib/prisma');
            const property = await prisma.property.findUnique({
              where: { id: propertyId },
              select: { isTrial: true, trialEndsAt: true, stripeSubscriptionId: true },
            });
            
            if (property?.isTrial && property.trialEndsAt) {
              isExpired = property.trialEndsAt < new Date() && !property.stripeSubscriptionId;
            }
            
            await redis.setex(statusKey, 300, isExpired ? 'expired' : 'active');
          }
          
          if (isExpired) {
            if (pathname.startsWith('/api')) {
              return NextResponse.json({
                error: 'Trial expirado. Faça upgrade para continuar.',
                code: 'TRIAL_EXPIRED',
                redirectTo: '/dashboard/upgrade',
              }, { status: 402 });
            }
            return NextResponse.redirect(new URL('/dashboard/upgrade', request.url));
          }
        }
      } catch {
        // Token inválido — deixa o fluxo normal tratar
      }
    }
  }

  return response;
}

// Configuração dos matchers
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

export default proxy;
