import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createError } from '@/lib/error-handler';
import { authRatelimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('payment_id');

    if (!paymentId) {
      return createError(400, 'MISSING_PAYMENT_ID', 'payment_id é obrigatório');
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.tenantId) return createError(401, 'UNAUTHORIZED', 'Faça login primeiro');
    const { success: allowed } = await authRatelimit.limit(session.user.tenantId);
    if (!allowed) return createError(429, 'RATE_LIMITED', 'Muitas requisições');

    const transaction = await db.paymentTransaction.findFirst({
      where: { externalId: paymentId },
      include: { subscription: true },
    });
    if (!transaction) return createError(404, 'TRANSACTION_NOT_FOUND', 'Transação não encontrada');
    if (transaction.subscription?.tenantId !== session.user.tenantId) {
      return createError(403, 'FORBIDDEN', 'Esta transação não pertence à sua conta');
    }

    const token = process.env.MP_ACCESS_TOKEN;
    if (!token) {
      return createError(500, 'MP_NOT_CONFIGURED', 'MP não configurado');
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await response.json();

    return NextResponse.json({
      id: data.id,
      status: data.status,
      status_detail: data.status_detail,
      transaction_amount: data.transaction_amount,
      date_created: data.date_created,
      date_approved: data.date_approved,
      point_of_interaction: {
        transaction_data: {
          qr_code: data.point_of_interaction?.transaction_data?.qr_code,
          qr_code_base64: data.point_of_interaction?.transaction_data?.qr_code_base64,
          ticket_url: data.point_of_interaction?.transaction_data?.ticket_url,
        },
      },
    });
  } catch (error) {
    console.error('PIX status error:', error);
    return createError(500, 'PIX_STATUS_FAILED', 'Falha ao verificar status do PIX');
  }
}
