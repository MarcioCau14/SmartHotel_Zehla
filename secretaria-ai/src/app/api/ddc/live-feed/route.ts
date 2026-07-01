import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { resolveTenantId, mapConversation } from '@/lib/ddc/ddc-mapper';
import { createError, apiSuccess } from '@/lib/error-handler';
import { apiRatelimit } from '@/lib/rate-limit';
import { z } from 'zod';

const messageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1),
  from: z.enum(['guest', 'ai', 'human']),
});

export async function POST(request: NextRequest) {
  try {
    const tenantId = await resolveTenantId();
    if (!tenantId || tenantId === 'client-001') return createError(401, 'UNAUTHORIZED', 'Não autorizado');
    const body = await request.json();
    const data = messageSchema.parse(body);

    const message = await db.conversationMessage.create({
      data: {
        conversationId: data.conversationId,
        content: data.content,
        from: data.from,
        timestamp: new Date(),
      },
    });

    await db.conversationLog.update({
      where: { id: data.conversationId },
      data: { lastUpdate: new Date() },
    });

    return apiSuccess({ message });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return createError(400, 'VALIDATION_ERROR', 'Invalid data');
    }
    console.error('[live-feed POST] Error:', error);
    return createError(500, 'CREATE_FAILED', 'Failed to create message');
  }
}

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();

  const tenantId = await resolveTenantId();
  if (!tenantId || tenantId === 'client-001') {
    return createError(401, 'UNAUTHORIZED', 'Não autorizado');
  }

  const stream = new ReadableStream({
    async start(controller) {
      let lastCheck = new Date();

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
