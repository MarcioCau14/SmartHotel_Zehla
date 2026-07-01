import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    // Update conversation status to escalated and create notification
    const [updatedConversation, notification] = await Promise.all([
      db.conversationLog.update({
        where: { id },
        data: {
          status: 'escalated',
          lastUpdate: new Date(),
        },
      }),
      db.notification.create({
        data: {
          tenantId,
          type: 'escalation',
          priority: 'urgent',
          title: '⚠️ Escalonamento Necessário',
          message: `Conversa com ${conversation.guestName} (${conversation.guestPhone}) requer atenção humana.`,
          actionUrl: `/conversations/${id}`,
          actionLabel: 'Ver Conversa',
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        conversation: {
          id: updatedConversation.id,
          status: updatedConversation.status,
          lastUpdate: updatedConversation.lastUpdate.toISOString(),
        },
        notification: {
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          priority: notification.priority,
          createdAt: notification.createdAt.toISOString(),
        },
      },
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error) {
    console.error('Error escalating conversation:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: '500',
          message: 'Failed to escalate conversation',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 500 }
    );
  }
}
