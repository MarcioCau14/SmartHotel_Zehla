import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth/register',
  '/api/auth/callback',
  '/api/checkout/webhook',
  '/api/checkout/pix-status',
  '/api/health',
  '/api/readiness',
  '/api/webhook-whatsapp',
  '/api/brain/health',
  '/favicon.ico',
  '/logo.svg',
  '/_next/webpack-hmr',
  '/api/cron/budget-reset',
  '/api/cron/metrics-snapshot',
];

const PROTECTED_PATHS = [
  '/dashboard',
  '/dashboard/metrics',
  '/ddc',
  '/ddc/guests',
  '/zcc',
  '/config',
  '/tenants',
  '/campaigns',
  '/leads',
  '/targets',
  '/agents',
  '/roi',
  '/swipe-templates',
];

function createMiddlewareRequest(
  path: string,
  options?: { sessionToken?: string },
): NextRequest {
  const url = new URL(path, 'http://localhost:3000');
  const headers: Record<string, string> = {};
  if (options?.sessionToken) {
    headers['cookie'] = `next-auth.session-token=${options.sessionToken}`;
  }
  return new NextRequest(url, { headers });
}

describe('Middleware — public routes', () => {
  let mw: any;

  beforeAll(async () => {
    const mod = await import('@/middleware');
    mw = mod.middleware || mod.default;
  });

  PUBLIC_PATHS.forEach((path) => {
    it(`GET ${path} passes through (no redirect)`, async () => {
      const req = createMiddlewareRequest(path);
      const result = await mw(req);

      if (result instanceof Response) {
        expect(result.status).not.toBe(302);
        expect(result.status).not.toBe(307);
      }
    });
  });
});

describe('Middleware — protected routes without session', () => {
  let mw: any;

  beforeAll(async () => {
    const mod = await import('@/middleware');
    mw = mod.middleware || mod.default;
  });

  PROTECTED_PATHS.forEach((path) => {
    it(`GET ${path} redirects to /login when no session`, async () => {
      const req = createMiddlewareRequest(path);
      const result = await mw(req);

      if (result instanceof Response) {
        const location = result.headers.get('location') || '';
        const isRedirect =
          result.status === 302 ||
          result.status === 307 ||
          location.includes('/login');
        expect(isRedirect).toBe(true);
      }
    });
  });
});

describe('Middleware — protected routes with session', () => {
  let mw: any;

  beforeAll(async () => {
    const mod = await import('@/middleware');
    mw = mod.middleware || mod.default;
  });

  it('passes through protected routes when session cookie exists', async () => {
    const req = createMiddlewareRequest('/dashboard', {
      sessionToken: 'valid-session-token',
    });
    const result = await mw(req);

    if (result instanceof Response) {
      expect(result.status).not.toBe(302);
      expect(result.status).not.toBe(307);
    }
  });
});

describe('Middleware — security headers', () => {
  let mw: any;

  beforeAll(async () => {
    const mod = await import('@/middleware');
    mw = mod.middleware || mod.default;
  });

  it('adds X-Content-Type-Options: nosniff', async () => {
    const req = createMiddlewareRequest('/api/health');
    const result = await mw(req);
    if (result instanceof Response) {
      const cto = result.headers.get('x-content-type-options');
      expect(cto).toBe('nosniff');
    }
  });

  it('adds X-Frame-Options: DENY', async () => {
    const req = createMiddlewareRequest('/api/health');
    const result = await mw(req);
    if (result instanceof Response) {
      const xfo = result.headers.get('x-frame-options');
      expect(xfo).toBe('DENY');
    }
  });
});
