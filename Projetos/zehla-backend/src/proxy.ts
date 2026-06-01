import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

import { redis } from '@/lib/redis';

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

  // BYPASS TOTAL EM DESENVOLVIMENTO
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return NextResponse.next();
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ?? request.headers.get('x-real-ip') ?? 'unknown';
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
    }
  } catch (e) {
    // Silently continue if Redis is offline during local dev
    console.warn('⚠️ [Proxy] Redis offline - bypassing security checks for dev stability');
  }


  // 0.1 Proteção Estrita ZCC (SUPER_ADMIN)
  if (ZCC_PATHS.some(p => pathname.startsWith(p)) && pathname !== '/zcc-login') {
    // DEVELOPER BYPASS: Allow ZCC access in development mode
    if (process.env.NODE_ENV === 'development') {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('x-zcc-user-id', 'dev-marcio-id');
      requestHeaders.set('x-zcc-role', 'SUPER_ADMIN');
      requestHeaders.set('x-zcc-tenant-id', 'global');

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

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

      // Injeta headers para downstream
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
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // 2. Verificação de Autenticação para Rotas Protegidas
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (isProtectedRoute) {
    const token = request.cookies.get('zehla-token')?.value || request.headers.get('Authorization');
    
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
