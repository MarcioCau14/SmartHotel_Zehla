import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
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
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * ZÉHLA Security Utility - ensures Tenant isolation.
 * Retrieves the tenant ID of the authenticated user or redirects if unauthorized.
 */
export async function requireTenant() {
  if (process.env.BYPASS_MIDDLEWARE_AUTH === 'true') {
    const firstTenant = await db.tenant.findFirst();
    if (firstTenant) {
      return firstTenant.id;
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
