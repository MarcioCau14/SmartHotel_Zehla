import { db } from '@/lib/db';
import { mapConversation } from '@/lib/ddc/ddc-mapper';
import { executeCognitivePipeline } from './ai/cognitive-router';
import { formatIntentLog } from './ai/intent-router';

/**
 * Global helper to notify active SSE DDC connections about new message events.
 */
export function notifyLiveFeed(tenantId: string, eventData: any) {
  const listeners = (globalThis as any).sseListeners;
  if (listeners) {
    const ssePayload = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const listener of listeners) {
      try {
        if (typeof listener === 'function') {
          listener(tenantId, ssePayload);
        }
      } catch (err) {
        // Dead connection clean-up is handled in the route
      }
    }
  }
}

/**
 * Registers an SSE listener to allow real-time client updates.
 */
export function registerSSEListener(listener: (tenantId: string, payload: string) => void): () => void {
  if (!(globalThis as any).sseListeners) {
    (globalThis as any).sseListeners = new Set();
  }
  (globalThis as any).sseListeners.add(listener);
  return () => {
    (globalThis as any).sseListeners.delete(listener);
  };
}

/**
 * Helper to fetch, map, and broadcast the updated conversation to the SSE stream.
 */
export async function broadcastConversationUpdate(tenantId: string, conversationId: string): Promise<void> {
  try {
    const fullConversation = await db.conversationLog.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { timestamp: 'asc' } } }
    });
    if (fullConversation) {
      notifyLiveFeed(tenantId, {
        type: 'update',
        data: mapConversation(fullConversation)
      });
    }
  } catch (error) {
    console.error('[broadcastConversationUpdate] Error sending SSE update:', error);
  }
}

interface ProcessParams {
  tenantId: string;
  guestPhone: string;
  guestName?: string;
  messageContent: string;
  messageFrom?: string; // 'whatsapp' | 'instagram' | 'web'
}

/**
 * Core ZÉLLA Brain pipeline - Processes incoming messages from guests,
 * resolves context, queries the Cognitive Router (Fase 2), saves everything to SQLite,
 * and notifies the real-time DDC dashboard.
 */
export async function processIncomingMessage(params: ProcessParams): Promise<{
  conversationId: string;
  aiResponse: string;
  guestId: string;
}> {
  const startTime = Date.now();
  const { tenantId, guestPhone, guestName, messageContent } = params;

  // 1. Fetch or create Guest
  let guest = await db.guest.findFirst({
    where: {
      tenantId,
      phone: guestPhone,
    },
  });

  if (!guest) {
    guest = await db.guest.create({
      data: {
        tenantId,
        name: guestName || `Hóspede — ${guestPhone}`,
        phone: guestPhone,
        status: 'new',
        source: params.messageFrom || 'whatsapp',
        conversationCount: 1,
        metadata: '{}',
      },
    });
  } else {
    // Increment conversation count
    guest = await db.guest.update({
      where: { id: guest.id },
      data: {
        conversationCount: { increment: 1 },
        lastContact: new Date(),
      },
    });
  }

  // 2. Fetch or create an active ConversationLog
  let conversation = await db.conversationLog.findFirst({
    where: {
      tenantId,
      guestId: guest.id,
      status: 'active',
    },
  });

  if (!conversation) {
    conversation = await db.conversationLog.create({
      data: {
        tenantId,
        guestId: guest.id,
        guestName: guest.name,
        guestPhone: guestPhone,
        status: 'active',
        aiConfidence: 0,
        metadata: '{}',
      },
    });
  }

  // 3. Save incoming guest message
  await db.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      from: 'guest',
      content: messageContent,
      metadata: '{}',
    },
  });

  // Notify DDC about the guest's message
  await broadcastConversationUpdate(tenantId, conversation.id);

  // 4. Load context dynamically from Prisma
  const [tenant, property, trainingPrompts, recentMessages] = await Promise.all([
    db.tenant.findUnique({ where: { id: tenantId } }),
    db.property.findFirst({ where: { tenantId } }),
    db.trainingPrompt.findMany({ where: { tenantId, isActive: true } }),
    db.conversationMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: 'asc' },
      take: 10,
    }),
  ]);

  // 4.1. Validar cota de mensagens e hóspedes do tenant baseado no seu plano
  const planType = tenant?.plan || 'trial';

  if (planType === 'trial' || planType === 'gratuito') {
    // Limite de 5 hóspedes nos últimos 7 dias
    const guestLimit = 5;
    const guestsCount = await db.guest.count({
      where: {
        tenantId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    if (guestsCount > guestLimit) {
      const responseText = "[IA Silenciada: Limite de hóspedes atendidos no plano Gratuito excedido (máximo 5)]";
      await db.conversationMessage.create({
        data: { conversationId: conversation.id, from: 'ai', content: responseText }
      });
      await broadcastConversationUpdate(tenantId, conversation.id);
      return { conversationId: conversation.id, aiResponse: responseText, guestId: guest.id };
    }

    // Limite de 100 mensagens nos últimos 7 dias
    const messageLimit = 100;
    const messagesCount = await db.conversationMessage.count({
      where: {
        from: 'ai',
        conversation: { tenantId },
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    if (messagesCount >= messageLimit) {
      const responseText = "[IA Silenciada: Limite de mensagens do plano Gratuito excedido (máximo 100)]";
      await db.conversationMessage.create({
        data: { conversationId: conversation.id, from: 'ai', content: responseText }
      });
      await broadcastConversationUpdate(tenantId, conversation.id);
      return { conversationId: conversation.id, aiResponse: responseText, guestId: guest.id };
    }
  } else if (planType === 'lite') {
    // Limite de 50 hóspedes nos últimos 30 dias
    const guestLimit = 50;
    const guestsCount = await db.guest.count({
      where: {
        tenantId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    if (guestsCount > guestLimit) {
      const responseText = "[IA Silenciada: Limite de hóspedes atendidos no plano LITE excedido (máximo 50). Faça upgrade para o plano PRO.]";
      await db.conversationMessage.create({
        data: { conversationId: conversation.id, from: 'ai', content: responseText }
      });
      await broadcastConversationUpdate(tenantId, conversation.id);
      return { conversationId: conversation.id, aiResponse: responseText, guestId: guest.id };
    }

    // Limite de 500 mensagens + recargas nos últimos 30 dias
    const subscription = await db.subscription.findFirst({
      where: { tenantId }
    });

    let recargasCompradas = 0;
    if (subscription) {
      const recargas = await db.paymentTransaction.count({
        where: {
          subscriptionId: subscription.id,
          type: 'message_recarga',
          status: 'approved'
        }
      });
      recargasCompradas = recargas * 250;
    }

    const messageLimit = 500 + recargasCompradas;
    const messagesCount = await db.conversationMessage.count({
      where: {
        from: 'ai',
        conversation: { tenantId },
        timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      }
    });

    if (messagesCount >= messageLimit) {
      const responseText = "[IA Silenciada: Limite de mensagens do plano LITE excedido. Adquira recargas adicionais no painel.]";
      await db.conversationMessage.create({
        data: { conversationId: conversation.id, from: 'ai', content: responseText }
      });
      await broadcastConversationUpdate(tenantId, conversation.id);
      return { conversationId: conversation.id, aiResponse: responseText, guestId: guest.id };
    }
  }

  // 5. Structure the dynamic system prompt
  const assistantName = (planType === 'max') 
    ? (trainingPrompts.find(p => p.type === 'name')?.content || 'ZÉLLA') 
    : 'ZÉLLA';

  const { formatConversationHistory } = await import('./ai/cognitive-router');
  const historyText = formatConversationHistory(
    recentMessages.map(m => ({
      from: m.from === 'guest' ? 'guest' : m.from === 'ai' ? 'ai' : 'human',
      content: m.content
    }))
  );

  let systemPrompt = `Você é a ${assistantName}, uma assistente virtual de inteligência artificial ultra-atenciosa e hospitaleira da pousada "${property?.name || 'Pousada'}".
Seu objetivo é sanar dúvidas, encantar o hóspede, sugerir acomodações e incentivar a reserva direta de forma natural, educada e calorosa.

${historyText}

=== INFORMAÇÕES GERAIS DA POUSADA ===
Nome: ${property?.name || 'Pousada'}
Endereço/Localização: ${property?.city || ''}, ${property?.state || ''}
Descrição/Tom: ${property?.description || 'Um refúgio tranquilo e acolhedor.'}

=== DIRETRIZES DE COMUNICAÇÃO ===
1. Responda de forma concisa e objetiva (máximo de 3 parágrafos curtos). Mensagens de WhatsApp muito longas cansam o hóspede.
2. Seja hospitaleira, use emojis de forma moderada e profissional.
3. Se o hóspede perguntar preços, apresente as opções de quartos disponíveis e pergunte a data desejada e quantidade de pessoas para refinar a cotação.
4. Responda SEMPRE em português do Brasil de forma natural.
5. Se for perguntado algo sobre o qual você não tem contexto ou informação no prompt, seja honesta e diga que vai verificar com o atendente humano, deixando a conversa em aberto.
6. Nunca invente informações que não estejam listadas nos quartos ou no FAQ.
`;

  if (trainingPrompts.length > 0) {
    systemPrompt += `\n=== DIRETRIZES ADICIONAIS DE TREINAMENTO ===\n`;
    for (const prompt of trainingPrompts) {
      if (prompt.type !== 'name') {
        systemPrompt += `[${prompt.type.toUpperCase()}] ${prompt.content}\n`;
      }
    }
  }

  // 6. Execute the Cognitive Pipeline
  let aiResponseText = '';
  let cognitiveRes: any = null;

  try {
    cognitiveRes = await executeCognitivePipeline({
      message: messageContent,
      tenantId,
      sessionId: conversation.id,
      systemPrompt,
    });
    aiResponseText = cognitiveRes.response;
  } catch (err) {
    console.error('[processIncomingMessage] Error executing cognitive pipeline:', err);
    aiResponseText = 'Desculpe, tive um probleminha para processar sua mensagem agora. Posso chamar alguém para te ajudar?';
  }

  const latency = Date.now() - startTime;

  // 7. Save the AI response
  const aiMessage = await db.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      from: 'ai',
      content: aiResponseText,
      metadata: JSON.stringify({
        latencyMs: latency,
        providerUsed: cognitiveRes?.providerId,
        tierUsed: cognitiveRes?.tierUsed,
        isMock: cognitiveRes?.isMock,
        pipeline: 'phase2',
        intent: cognitiveRes?.intent,
        guard: cognitiveRes?.securityAlerts,
        rag: cognitiveRes?.searchStats,
        tools: cognitiveRes?.toolCalls,
      }),
    },
  });

  // 8. Update ConversationLog lastUpdate, status and confidence score
  const confidencePct = Math.round((cognitiveRes?.confidence || 0.85) * 100);
  const nextStatus = (cognitiveRes?.requiresHumanHandover || cognitiveRes?.intent === 'human_handover')
    ? 'escalated'
    : 'active';

  await db.conversationLog.update({
    where: { id: conversation.id },
    data: {
      lastUpdate: new Date(),
      status: nextStatus,
      aiConfidence: confidencePct,
    },
  });

  // 9. Record activities and alerts
  const intentLog = cognitiveRes ? formatIntentLog({
    intent: cognitiveRes.intent,
    confidence: cognitiveRes.confidence,
    method: 'heuristic',
    matchedKeywords: [],
    timestamp: new Date()
  } as any) : 'UNKNOWN';

  await Promise.all([
    db.aIActivityLog.create({
      data: {
        tenantId,
        type: nextStatus === 'escalated' ? 'escalation' : 'message',
        message: `IA respondeu em background (${latency}ms, Confiança: ${confidencePct}%, Intent: ${intentLog})`,
        status: 'success',
        duration: latency,
        metadata: JSON.stringify({
          messageId: aiMessage.id,
          provider: cognitiveRes?.providerId,
          costUsd: 0,
          isMock: cognitiveRes?.isMock,
        }),
      },
    }),
    db.notification.create({
      data: {
        tenantId,
        title: `Nova mensagem WhatsApp — ${guest.name}`,
        message: messageContent.length > 60 ? `${messageContent.substring(0, 60)}...` : messageContent,
        type: nextStatus === 'escalated' ? 'escalation' : 'message',
        priority: nextStatus === 'escalated' ? 'high' : 'medium',
        read: false,
        actionLabel: 'Ver conversa',
        actionUrl: `/ddc?guest=${guest.id}`,
      },
    }),
  ]);

  // 10. Notify DDC about the AI's response
  await broadcastConversationUpdate(tenantId, conversation.id);

  return {
    conversationId: conversation.id,
    aiResponse: aiResponseText,
    guestId: guest.id,
  };
}
