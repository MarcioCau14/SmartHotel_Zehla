import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

function mapStatus(s: string): 'in_progress' | 'escalated' | 'closed' {
  if (s === 'active') return 'in_progress';
  if (s === 'escalated') return 'escalated';
  return 'closed';
}

function mapMessage(m: any) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    role: m.from === 'guest' ? 'user' as const : m.from === 'ai' ? 'assistant' as const : 'system' as const,
    content: m.content,
    confidence: m.from === 'ai' ? undefined : undefined,
    metadata: {},
    createdAt: m.timestamp,
  };
}

function mapConversation(c: any) {
  return {
    id: c.id,
    guestId: c.guestId,
    guestName: c.guestName,
    phoneNumber: c.guestPhone,
    status: mapStatus(c.status),
    aiScore: c.aiConfidence,
    needsEscalation: c.status === 'escalated',
    metadata: {},
    messages: (c.messages || []).map(mapMessage),
    propertyId: c.tenantId,
    createdAt: c.createdAt,
    updatedAt: c.lastUpdate,
  };
}

export async function GET(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const escalated = searchParams.get('escalated');
    const search = searchParams.get('search');

    const where: any = { tenantId };
    if (status) {
      if (status === 'in_progress') where.status = 'active';
      else if (status === 'closed') where.status = { in: ['resolved', 'abandoned'] };
      else where.status = status;
    }
    if (escalated === 'true') where.status = 'escalated';
    if (search) {
      where.OR = [
        { guestName: { contains: search } },
        { guestPhone: { contains: search } },
      ];
    }

    const conversations = await db.conversationLog.findMany({
      where,
      include: { messages: { orderBy: { timestamp: 'asc' } } },
      orderBy: { lastUpdate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: { items: conversations.map(mapConversation), total: conversations.length, page: 1, limit: conversations.length, totalPages: 1 }
    });
  } catch (error) {
    console.error('[DDC conversations] Prisma error:', error);
    return NextResponse.json({ success: true, data: { items: [], total: 0, page: 1, limit: 0, totalPages: 0 } });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.conversationId) return NextResponse.json({ success: false, error: { code: '400', message: 'Missing conversationId' } }, { status: 400 });
    await db.conversationLog.delete({ where: { id: body.conversationId } });
    return NextResponse.json({ success: true, data: null });
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: '500', message: 'Failed to delete conversation' } }, { status: 500 });
  }
}
