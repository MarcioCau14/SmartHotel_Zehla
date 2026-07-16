import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db, isDatabaseAvailable } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

/** Safe demo user returned when DB is unavailable (e.g. Vercel serverless without SQLite) */
const DEMO_USER = {
  id: 'demo-tenant-id',
  email: 'demo@zehla.com',
  name: 'Demo Zélla',
  role: 'owner' as const,
  tenantId: 'demo-tenant-id',
  plan: 'pro' as const,
};

/** Check if we're running on Vercel (serverless — no persistent SQLite) */
function isVercelServerless(): boolean {
  return !!(process.env.VERCEL || process.env.VERCEL_ENV);
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Login', type: 'text' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[auth] authorize() called — email:', credentials?.email, '| vercel:', isVercelServerless());

        // === BYPASS 123/123 — Dev & Demo Quick Access ===
        if (credentials?.email === '123' && credentials?.password === '123') {
          console.log('[auth] 123/123 bypass activated');
          // On Vercel serverless, skip DB entirely — SQLite file doesn't exist there
          if (isVercelServerless()) {
            console.log('[auth] Vercel serverless — returning DEMO_USER');
            return DEMO_USER;
          }
          try {
            const dbOk = await isDatabaseAvailable();
            console.log('[auth] DB available:', dbOk);
            if (dbOk) {
              const firstTenant = await db.tenant.findFirst();
              if (firstTenant) {
                console.log('[auth] Found tenant:', firstTenant.id, firstTenant.name);
                return {
                  id: firstTenant.id,
                  email: firstTenant.email,
                  name: firstTenant.name,
                  role: firstTenant.role || 'owner',
                  tenantId: firstTenant.id,
                  plan: firstTenant.plan || 'pro',
                };
              }
            }
          } catch (err) {
            console.error('[auth] DB error on 123/123 bypass:', err);
          }
          console.log('[auth] No DB tenant found — returning DEMO_USER');
          return DEMO_USER;
        }

        // === BYPASS_MIDDLEWARE_AUTH mode (dev/staging) ===
        if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
          console.log('[auth] BYPASS_MIDDLEWARE_AUTH=true — accepting any credentials');
          if (isVercelServerless()) {
            return {
              id: 'mock-tenant-id',
              email: credentials?.email || 'admin@smarthotel.com',
              name: 'Usuário Convidado',
              role: 'owner',
              tenantId: 'mock-tenant-id',
              plan: 'pro',
            };
          }
          try {
            const dbOk = await isDatabaseAvailable();
            if (dbOk) {
              const firstTenant = await db.tenant.findFirst();
              if (firstTenant) {
                return {
                  id: firstTenant.id,
                  email: firstTenant.email,
                  name: firstTenant.name,
                  role: firstTenant.role,
                  tenantId: firstTenant.id,
                  plan: firstTenant.plan,
                };
              }
            }
          } catch {
            // DB not available
          }
          return {
            id: 'mock-tenant-id',
            email: credentials?.email || 'admin@smarthotel.com',
            name: 'Usuário Convidado',
            role: 'owner',
            tenantId: 'mock-tenant-id',
            plan: 'pro',
          };
        }

        if (!credentials?.email || !credentials?.password) {
          console.log('[auth] Missing credentials — returning null');
          return null;
        }

        // On Vercel, no DB means no real authentication possible
        if (isVercelServerless()) {
          console.log('[auth] Vercel serverless + no bypass — cannot authenticate');
          return null;
        }

        // Try Tenant table (main auth for pousada owners, admins, staff)
        try {
          const dbOk = await isDatabaseAvailable();
          if (!dbOk) return null;

          const tenant = await db.tenant.findUnique({
            where: { email: credentials.email },
          });

          if (tenant && tenant.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, tenant.passwordHash);
            if (isValid) {
              console.log('[auth] Tenant authenticated:', tenant.id, tenant.name);
              return {
                id: tenant.id,
                email: tenant.email,
                name: tenant.name,
                role: tenant.role,
                tenantId: tenant.id,
                plan: tenant.plan,
              };
            }
          }
          console.log('[auth] Invalid credentials for:', credentials.email);
        } catch (err) {
          console.error('[auth] DB error during auth:', err);
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).tenantId = (token as any).tenantId;
        (session.user as any).role = (token as any).role;
        (session.user as any).plan = (token as any).plan;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'zehla-demo-secret-2026-prod',
  debug: process.env.NODE_ENV === 'development',
};

/**
 * ZÉHLA Security Utility - ensures Tenant isolation.
 * Retrieves the tenant ID of the authenticated user or redirects if unauthorized.
 */
export async function requireTenant() {
  // On Vercel serverless, return the demo/mock tenant
  if (isVercelServerless()) {
    const session = await getServerSession(authOptions);
    return session?.user?.tenantId || 'demo-tenant-id';
  }

  if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
    try {
      const dbOk = await isDatabaseAvailable();
      if (dbOk) {
        const firstTenant = await db.tenant.findFirst();
        if (firstTenant) {
          return firstTenant.id;
        }
      }
    } catch {
      // DB not available
    }
    return 'mock-tenant-id';
  }

  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const tenantId = session.user.tenantId;
  if (!tenantId) {
    redirect('/login');
  }

  return tenantId;
}

/**
 * Verify authorization token for the ZEHLA Loop Engine (robots/agents API)
 */
export function verifyRobotToken(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];
  return token === process.env.ZEHLA_LOOP_API_KEY || token === process.env.ZAI_API_KEY;
}
