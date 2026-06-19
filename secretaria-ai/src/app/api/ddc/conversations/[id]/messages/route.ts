import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const TENANT_ID = 'client-001';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const conversation = await db.conversationLog.findUnique({
      where: { id },
    });

    if (!conversation) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: '404',
            message: 'Conversation not found',
          },
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    if (!body.content) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: '400',
            message: 'Missing required field: content',
          },
        },
        { status: 400 }
      );
    }

    const [message] = await Promise.all([
      db.conversationMessage.create({
        data: {
          conversationId: id,
          from: 'human',
          content: body.content,
          metadata: body.metadata || '{}',
        },
      }),
      db.conversationLog.update({
        where: { id },
        data: { lastUpdate: new Date() },
      }),
    ]);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: message.id,
          conversationId: message.conversationId,
          from: message.from,
          content: message.content,
          timestamp: message.timestamp.toISOString(),
          read: message.read,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: '500',
          message: 'Failed to create message',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
