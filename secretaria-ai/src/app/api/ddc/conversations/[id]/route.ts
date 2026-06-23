import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversation = await db.conversationLog.findUnique({
      where: { id },
      include: { messages: { orderBy: { timestamp: 'asc' } } },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversa não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: conversation });
  } catch (error) {
    console.error('Get conversation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    console.error('Update conversation error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
