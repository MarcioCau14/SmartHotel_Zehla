import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export interface AuthSession {
  tenantId: string;
  sub?: string;
  [key: string]: unknown;
}

export async function getAuthSession(
  request: NextRequest
): Promise<{ session: AuthSession | null; errorResponse: NextResponse | null }> {
  try {
    const token = await getToken({
      req: request as any,
      secret: process.env.NEXTAUTH_SECRET,
    });
    if (!token?.tenantId) {
      return {
        session: null,
        errorResponse: NextResponse.json({ error: 'Não autorizado' }, { status: 401 }),
      };
    }
    return { session: token as AuthSession, errorResponse: null };
  } catch {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: 'Sessão inválida' }, { status: 401 }),
    };
  }
}

export function withAuth(
  handler: (request: NextRequest, session: AuthSession) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { session, errorResponse } = await getAuthSession(request);
    if (errorResponse) return errorResponse;
    return handler(request, session!);
  };
}
