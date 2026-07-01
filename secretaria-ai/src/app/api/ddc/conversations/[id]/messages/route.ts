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
    const { id: conversationId } = await params;
    const messages = await db.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return sendError(500, 'INTERNAL_ERROR', 'Erro interno');
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
      return sendError(400, 'MISSING_FIELDS', 'from e content são obrigatórios');
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

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    return sendError(500, 'INTERNAL_ERROR', 'Erro interno');
  }
}
