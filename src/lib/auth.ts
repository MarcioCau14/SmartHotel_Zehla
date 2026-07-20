import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { db, isDatabaseAvailable } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import type { PlanTier } from '@/lib/plan-features';
import type { NicheType } from '@/contexts/NicheContext';
import { migratePlanLegacy } from '@/lib/plan-features';

/** Safe demo user returned when DB is unavailable (e.g. Vercel serverless without SQLite) */
const DEMO_USER = {
  id: 'demo-tenant-id',
  email: 'demo@zehla.com',
  name: 'Demo Zélla',
  role: 'owner' as const,
  tenantId: 'demo-tenant-id',
  plan: 'pro' as PlanTier,
  niche: 'pousada' as NicheType,
  isDemoUser: true, // Flag para middleware permitir acesso ZCC temporário
};

/** Check if we're running on Vercel (serverless — no persistent SQLite) */
function isVercelServerless(): boolean {
  return !!(process.env.VERCEL || process.env.VERCEL_ENV);
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db as any),
  providers: [
    // ── Google OAuth ──────────────────────────────────────────
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      allowDangerousEmailAccountLinking: true,
    }),

    // ── Credentials (existing) ────────────────────────────────
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
                  plan: migratePlanLegacy(firstTenant.plan || 'gratuito'),
                  niche: (firstTenant as any).niche || 'pousada',
                  isDemoUser: true, // Flag para middleware permitir acesso ZCC temporário
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
              plan: 'pro' as PlanTier,
              niche: 'pousada' as NicheType,
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
                  plan: migratePlanLegacy(firstTenant.plan),
                  niche: (firstTenant as any).niche || 'pousada',
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
            plan: 'pro' as PlanTier,
            niche: 'pousada' as NicheType,
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
                plan: migratePlanLegacy(tenant.plan),
                niche: (tenant as any).niche || 'pousada',
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
    async signIn({ user, account, profile }) {
      // For OAuth providers (Google), ensure a Tenant exists
      if (account?.provider === 'google' && user.email) {
        try {
          const dbOk = await isDatabaseAvailable();
          if (dbOk) {
            // Check if a tenant exists for this email
            const existingTenant = await db.tenant.findUnique({
              where: { email: user.email },
            });
            if (!existingTenant) {
              // Create a new tenant for OAuth users
              const newTenant = await db.tenant.create({
                data: {
                  name: user.name || user.email.split('@')[0],
                  email: user.email,
                  plan: 'gratuito',
                  status: 'active',
                  niche: 'pousada',
                  trialStart: new Date(),
                  trialEnd: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                },
              });
              // Link the User to the Tenant
              if (user.id) {
                await db.user.update({
                  where: { id: user.id },
                  data: { tenant: { connect: { id: newTenant.id } } },
                });
              }
            } else {
              // Link existing tenant to user if not linked
              if (user.id) {
                const existingUser = await db.user.findUnique({
                  where: { id: user.id },
                });
                if (existingUser && !existingUser.tenantId) {
                  await db.user.update({
                    where: { id: user.id },
                    data: { tenant: { connect: { id: existingTenant.id } } },
                  });
                }
              }
            }
          }
        } catch (err) {
          console.error('[auth] Error during Google OAuth sign-in:', err);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
        token.plan = (user as any).plan;
        token.niche = (user as any).niche;
        // Flag para acesso ZCC temporário (login 123/123)
        if ((user as any).isDemoUser) {
          (token as any).isDemoUser = true;
        }

        // For OAuth users, look up tenant info
        if (account?.provider === 'google') {
          try {
            const dbOk = await isDatabaseAvailable();
            if (dbOk && user.email) {
              const tenant = await db.tenant.findUnique({
                where: { email: user.email },
              });
              if (tenant) {
                token.tenantId = tenant.id;
                token.role = tenant.role;
                token.plan = migratePlanLegacy(tenant.plan);
                token.niche = (tenant as any).niche || 'pousada';
              }
            }
          } catch (err) {
            console.error('[auth] Error looking up tenant in JWT callback:', err);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).tenantId = (token as any).tenantId;
        (session.user as any).role = (token as any).role;
        (session.user as any).plan = (token as any).plan;
        (session.user as any).niche = (token as any).niche;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows callbackUrl from signIn() calls
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      if (new URL(url).origin === baseUrl) return url;
      // Default redirect based on niche
      return baseUrl + '/ddc';
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?mode=verify',
  },
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET environment variable is required in production');
    }
    return secret || 'zehla-dev-secret-not-for-production';
  })(),
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

  const tenantId = (session.user as any).tenantId;
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
