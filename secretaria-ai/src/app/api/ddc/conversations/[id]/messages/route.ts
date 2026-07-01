import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/ddc-mapper';
import { createError, apiSuccess } from '@/lib/error-handler';
import { apiRatelimit } from '@/lib/rate-limit';

async function guard(): Promise<string | NextResponse> {
  const tenantId = await resolveTenantId();
  if (!tenantId || tenantId === 'client-001') return createError(401, 'UNAUTHORIZED', 'Não autorizado');
  const { success } = await apiRatelimit.limit(tenantId);
  if (!success) return createError(429, 'RATE_LIMITED', 'Muitas requisições');
  return tenantId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id: conversationId } = await params;
    const messages = await db.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    });
    return apiSuccess(messages);
  } catch (error) {
    return createError(500, 'INTERNAL_ERROR', 'Erro interno');
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id: conversationId } = await params;
    const body = await request.json();
    const { from, content, metadata = {} } = body;

    if (!from || !content) {
      return createError(400, 'MISSING_FIELDS', 'from e content são obrigatórios');
    }

    const message = await db.conversationMessage.create({
      data: {
        conversationId,
        from,
        content,
        metadata: JSON.stringify(metadata),
      },
    });

    await db.conversationLog.update({
      where: { id: conversationId },
      data: { lastUpdate: new Date() },
    });

    return apiSuccess(message, { status: 201 });
  } catch (error) {
    return createError(500, 'INTERNAL_ERROR', 'Erro interno');
  }
}
