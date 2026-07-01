import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { sendError } from '@/lib/send-error';
import { authRatelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscriptionId = searchParams.get('subscription_id');

    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) return sendError(401, 'UNAUTHORIZED', 'Faça login primeiro');
    const { success: allowed } = await authRatelimit.limit(session.user.tenantId);
    if (!allowed) return sendError(429, 'RATE_LIMITED', 'Muitas requisições');

    if (subscriptionId) {
      const subscription = await db.subscription.findUnique({
        where: { id: subscriptionId },
      });
      if (subscription && subscription.tenantId !== session.user.tenantId) {
        return sendError(403, 'FORBIDDEN', 'Esta assinatura não pertence à sua conta');
      }
    }

    return NextResponse.redirect(
      new URL('/?payment=cancelled', request.url)
    );
  } catch (error) {
    console.error('Checkout cancel error:', error);
    return sendError(500, 'CANCEL_FAILED', 'Falha ao cancelar checkout');
  }
}