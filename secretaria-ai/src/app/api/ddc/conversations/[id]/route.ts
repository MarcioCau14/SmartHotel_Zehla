import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/ddc-mapper';
import { sendError } from '@/lib/send-error';
import { apiRatelimit } from '@/lib/rate-limit';

async function guard(): Promise<string | NextResponse> {
  const tenantId = await resolveTenantId();
  if (!tenantId || tenantId === 'client-001') return sendError(401, 'UNAUTHORIZED', 'Não autorizado');
  const { success } = await apiRatelimit.limit(tenantId);
  if (!success) return sendError(429, 'RATE_LIMITED', 'Muitas requisições');
  return tenantId;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id } = await params;
    const conversation = await db.conversationLog.findUnique({
      where: { id },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    });

    if (!conversation) {
      return sendError(404, 'NOT_FOUND', 'Conversa não encontrada');
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    return sendError(500, 'INTERNAL_ERROR', 'Erro interno');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const g = await guard();
    if (g instanceof NextResponse) return g;
    const { id } = await params;
    const body = await request.json();
    const { status, aiConfidence, metadata } = body;

    const conversation = await db.conversationLog.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(aiConfidence !== undefined && { aiConfidence }),
        ...(metadata && { metadata: JSON.stringify(metadata) }),
        lastUpdate: new Date(),
      },
    });

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    return sendError(500, 'INTERNAL_ERROR', 'Erro interno');
  }
}
