import { NextRequest, NextResponse } from 'next/server';

type RouteHandler = (
  req: NextRequest,
  context?: { params: Promise<Record<string, string>> }
) => Promise<NextResponse> | NextResponse;

interface SecurityOptions {
  rateLimit?: { limit: number; windowSeconds: number } | false;
  cors?: boolean;
  csrf?: boolean;
}

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:3000,https://smarthotelzehla.vercel.app,https://zehla.com.br').split(',').map(s => s.trim());

function getOrigin(req: NextRequest): string | null {
  return req.headers.get('origin');
}

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

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('x-real-ip')
    || req.headers.get('cf-connecting-ip')
    || '127.0.0.1';
}

async function enforceRateLimit(req: NextRequest, limit: number, windowSeconds: number): Promise<boolean> {
  try {
    const ip = getClientIp(req);
    const method = req.method;
    const path = new URL(req.url).pathname;
    const key = `rl:${method}:${path}:${ip}`;
    const { rateLimit } = await import('../security/rate-limit');
    const result = await rateLimit(key, limit, windowSeconds);
    if (!result.success) return false;
    return true;
  } catch {
    return true;
  }
}

async function enforceCsrf(req: NextRequest): Promise<boolean> {
  try {
    const token = req.headers.get('x-csrf-token');
    if (!token) return false;
    const { jwtVerify } = await import('jose');
    const secret = new TextEncoder().encode(process.env.CSRF_SECRET || process.env.ZEHLA_JWT_SECRET || 'csrf-dev-fallback');
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

const WEBHOOK_PATHS = ['/api/webhooks/', '/api/blast/webhook'];

function isWebhookPath(pathname: string): boolean {
  return WEBHOOK_PATHS.some(p => pathname.startsWith(p));
}

const MUTATION_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

export function withApiSecurity(handler: RouteHandler, options: SecurityOptions = {}): RouteHandler {
  const { rateLimit: rlConfig = { limit: 100, windowSeconds: 60 }, cors = true, csrf = false } = options;

  return async (req: NextRequest, context?: { params: Promise<Record<string, string>> }): Promise<NextResponse> => {
    const origin = getOrigin(req);
    const pathname = new URL(req.url).pathname;

    if (req.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      if (cors) addCorsHeaders(response, origin);
      return response;
    }

    if (cors && req.method !== 'OPTIONS') {
    }

    if (rlConfig !== false && !isWebhookPath(pathname)) {
      const { limit = 100, windowSeconds = 60 } = rlConfig;
      const allowed = await enforceRateLimit(req, limit, windowSeconds);
      if (!allowed) {
        const response = NextResponse.json(
          { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED' },
          { status: 429 }
        );
        if (cors) addCorsHeaders(response, origin);
        return response;
      }
    }

    if (csrf && MUTATION_METHODS.includes(req.method)) {
      const valid = await enforceCsrf(req);
      if (!valid) {
        const response = NextResponse.json(
          { error: 'CSRF validation failed', code: 'CSRF_INVALID' },
          { status: 403 }
        );
        if (cors) addCorsHeaders(response, origin);
        return response;
      }
    }

    const response = await handler(req, context);

    if (cors && response instanceof NextResponse) {
      addCorsHeaders(response, origin);
    }

    return response;
  };
}
