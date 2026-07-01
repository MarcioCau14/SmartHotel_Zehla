import { db } from '@/lib/db';
import { getNeuroRouter } from '@/lib/ai/zaos-neuro-router';
import { mapConversation } from '@/lib/ddc/ddc-mapper';

/**
 * Global helper to notify active SSE DDC connections about new message events.
 */
export function notifyLiveFeed(tenantId: string, eventData: any) {
  const listeners = (globalThis as any).sseListeners;
  if (listeners) {
    const ssePayload = `data: ${JSON.stringify(eventData)}\n\n`;
    for (const listener of listeners) {
      try {
        listener(tenantId, ssePayload);
      } catch (err) {
        // Dead connection clean-up is handled in the route
      }
    }
  }
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
 * resolves context, queries the ZaosNeuroRouter, saves everything to SQLite,
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
  const guestMessage = await db.conversationMessage.create({
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
  const [property, rooms, knowledge, trainingPrompts, recentMessages] = await Promise.all([
    db.property.findFirst({ where: { tenantId } }),
    db.room.findMany({ where: { property: { tenantId } } }), // Query rooms via Property filter
    db.knowledgeEntry.findMany({ where: { tenantId } }),
    db.trainingPrompt.findMany({ where: { tenantId, isActive: true } }),
    db.conversationMessage.findMany({
      where: { conversationId: conversation.id },
      orderBy: { timestamp: 'asc' },
      take: 10,
    }),
  ]);

  // 5. Structure the dynamic system prompt
  let systemPrompt = `
Você é a ZÉLLA, uma assistente virtual de inteligência artificial ultra-atenciosa e hospitaleira da pousada "${property?.name || 'Pousada' }".
Seu objetivo é sanar dúvidas, encantar o hóspede, sugerir acomodações e incentivar a reserva direta de forma natural, educada e calorosa.

=== INFORMAÇÕES GERAIS DA POUSADA ===
Nome: ${property?.name || 'Pousada'}
Endereço/Localização: ${property?.city || ''}, ${property?.state || ''}
Descrição/Tom: ${property?.description || 'Um refúgio tranquilo e acolhedor.'}

=== NOSSAS ACOMODAÇÕES (QUARTOS) ===
${rooms.length > 0 
  ? rooms.map(r => `- Quarto: ${r.name} (Capacidade: ${r.capacity} pessoas, Preço base: R$${r.price}/diária)`).join('\n')
  : 'Consulte o gerente de reservas para valores de quartos.'}

=== INFORMAÇÕES ADICIONAIS & REGRAS (FAQ) ===
${knowledge.length > 0
  ? knowledge.map(k => `- Pergunta/Tópico: ${k.question}\n  Resposta: ${k.answer}`).join('\n')
  : 'Check-in padrão a partir das 14h, check-out até às 12h.'}

=== DIRETRIZES DE COMUNICAÇÃO ===
1. Responda de forma concisa e objetiva (máximo de 3 parágrafos curtos). Mensagens de WhatsApp muito longas cansam o hóspede.
2. Seja hospitaleira, use emojis de forma moderada e profissional.
3. Se o hóspede perguntar preços, apresente as opções de quartos disponíveis e pergunte a data desejada e quantidade de pessoas para refinar a cotação.
4. Responda SEMPRE em português do Brasil de forma natural.
5. Se for perguntado algo sobre o qual você não tem contexto ou informação no prompt, seja honesta e diga que vai verificar com o atendente humano, deixando a conversa em aberto.
6. Nunca invente informações que não estejam listadas nos quartos ou no FAQ acima.
`;

  if (trainingPrompts.length > 0) {
    systemPrompt += `\n=== DIRETRIZES ADICIONAIS DE TREINAMENTO ===\n`;
    for (const prompt of trainingPrompts) {
      systemPrompt += `[${prompt.type.toUpperCase()}] ${prompt.content}\n`;
    }
  }

  // 6. Build the conversation thread prompt
  let conversationThread = 'Abaixo está o histórico recente de interações com este hóspede:\n';
  for (const msg of recentMessages) {
    const sender = msg.from === 'guest' ? 'Hóspede' : msg.from === 'ai' ? 'ZÉLLA (IA)' : 'Atendente Humano';
    conversationThread += `\n[${sender}]: ${msg.content}`;
  }
  conversationThread += `\n\n[Hóspede] (última mensagem recebida): ${messageContent}\n\nZÉLLA (IA):`;

  // 7. Invoke the ZaosNeuroRouter
  const router = await getNeuroRouter();
  const aiResult = await router.generate({
    message: conversationThread,
    systemPrompt,
    sessionId: conversation.id,
    tier: 2, // Use Tier 2 for general guest messaging
  });

  const aiResponseText = aiResult.response;
  const latency = Date.now() - startTime;

  // 8. Save the AI response
  const aiMessage = await db.conversationMessage.create({
    data: {
      conversationId: conversation.id,
      from: 'ai',
      content: aiResponseText,
      metadata: JSON.stringify({
        latencyMs: latency,
        providerUsed: aiResult.providerId,
        tierUsed: aiResult.tier,
        isMock: aiResult.isMock,
      }),
    },
  });

  // 9. Update ConversationLog lastUpdate and confidence score
  const confidencePct = Math.round((aiResult.confidence || 0.85) * 100);
  await db.conversationLog.update({
    where: { id: conversation.id },
    data: {
      lastUpdate: new Date(),
      aiConfidence: confidencePct,
    },
  });

  // 10. Record activities and alerts
  await Promise.all([
    db.aIActivityLog.create({
      data: {
        tenantId,
        type: 'message',
        message: `IA respondeu em background (${latency}ms, Confiança: ${confidencePct}%)`,
        status: 'success',
        duration: latency,
        metadata: JSON.stringify({
          messageId: aiMessage.id,
          provider: aiResult.providerId,
          costUsd: aiResult.costUsd,
          isMock: aiResult.isMock,
        }),
      },
    }),
    db.notification.create({
      data: {
        tenantId,
        title: `Nova mensagem WhatsApp — ${guest.name}`,
        message: messageContent.length > 60 ? `${messageContent.substring(0, 60)}...` : messageContent,
        type: 'escalation',
        priority: 'medium',
        read: false,
        actionLabel: 'Ver conversa',
        actionUrl: `/ddc?guest=${guest.id}`,
      },
    }),
  ]);

  // 11. Notify DDC about the AI's response
  await broadcastConversationUpdate(tenantId, conversation.id);

  return {
    conversationId: conversation.id,
    aiResponse: aiResponseText,
    guestId: guest.id,
  };
}
