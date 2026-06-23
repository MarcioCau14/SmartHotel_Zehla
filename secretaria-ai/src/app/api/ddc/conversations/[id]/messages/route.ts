import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const messages = await db.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
    });
    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    console.error('Get messages error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json();
    const { from, content, type = 'text', metadata = {} } = body;

    if (!from || !content) {
      return NextResponse.json({ error: 'from e content são obrigatórios' }, { status: 400 });
    }

    const message = await db.conversationMessage.create({
      data: {
        conversationId,
        from,
        content,
        metadata: JSON.stringify({ ...metadata, type }),
      },
    });

    await db.conversationLog.update({
      where: { id: conversationId },
      data: { lastUpdate: new Date() },
    });

    return NextResponse.json({ success: true, data: message }, { status: 201 });
  } catch (error) {
    console.error('Create message error:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
