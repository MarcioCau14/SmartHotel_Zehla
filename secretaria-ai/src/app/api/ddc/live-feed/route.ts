import { NextRequest } from 'next/server';
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
    confidence: undefined,
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
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let tenantId = 'client-001';
      let lastCheck = new Date();

      try {
        tenantId = await resolveTenantId();
      } catch {
        // use fallback
      }

      // Initial load
      try {
        const conversations = await db.conversationLog.findMany({
          where: { tenantId, status: 'active' },
          include: { messages: { orderBy: { timestamp: 'asc' } } },
          orderBy: { lastUpdate: 'desc' },
        });
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'initial', data: conversations.map(mapConversation) })}\n\n`));
      } catch (error) {
        console.error('[live-feed] Initial load error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'initial', data: [] })}\n\n`));
      }

      // Polling loop
      const interval = setInterval(async () => {
        try {
          const newMessages = await db.conversationMessage.findMany({
            where: { createdAt: { gt: lastCheck } },
            include: { conversation: true },
            orderBy: { createdAt: 'desc' },
          });

          if (newMessages.length > 0) {
            // Get unique conversation IDs
            const convIds = [...new Set(newMessages.map(m => m.conversationId))];
            const updatedConvs = await db.conversationLog.findMany({
              where: { id: { in: convIds } },
              include: { messages: { orderBy: { timestamp: 'asc' } } },
            });

            for (const conv of updatedConvs) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'update', data: mapConversation(conv) })}\n\n`));
            }
          }
          lastCheck = new Date();
        } catch (error) {
          // Silently continue polling
        }
      }, 5000);

      // Cleanup on disconnect
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });

      // Auto-close after 10 minutes
      setTimeout(() => {
        clearInterval(interval);
        controller.close();
      }, 10 * 60 * 1000);
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    }
  });
}
