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

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        // === BYPASS 123/123 — Dev & Demo Quick Access ===
        if (credentials?.email === '123' && credentials?.password === '123') {
          try {
            const dbOk = await isDatabaseAvailable();
            if (dbOk) {
              const firstTenant = await db.tenant.findFirst();
              if (firstTenant) {
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
          } catch {
            // DB not available — fall through to demo user
          }
          return DEMO_USER;
        }

        if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
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
        } catch {
          // DB error — cannot authenticate
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
        token.tenantId = user.tenantId;
        token.role = user.role;
        token.plan = user.plan;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.tenantId = token.tenantId;
        session.user.role = token.role;
        session.user.plan = token.plan;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'zehla-demo-secret-2026-prod',
};

/**
 * ZÉHLA Security Utility - ensures Tenant isolation.
 * Retrieves the tenant ID of the authenticated user or redirects if unauthorized.
 */
export async function requireTenant() {
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
