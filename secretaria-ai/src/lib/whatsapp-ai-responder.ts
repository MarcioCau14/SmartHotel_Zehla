import { db } from '@/lib/db';
import { getNeuroRouter } from '@/lib/ai/zaos-neuro-router';
import { sendWhatsAppMessage } from './whatsapp-send';
import { resolveTenantId } from '@/lib/ddc/auth-utils';

/**
 * Função principal em background para carregar contexto do hotel, responder
 * a mensagens recebidas do hóspede de forma contextualizada usando a IA,
 * persistir a resposta no banco e tentar o envio físico.
 *
 * @param conversationId - ID do ConversationLog correspondente
 * @param guestId - ID do Guest correspondente
 * @param lastMessageContent - Texto da última mensagem recebida do hóspede
 */
export async function respondToWhatsAppMessage(
  conversationId: string,
  guestId: string,
  lastMessageContent: string
): Promise<void> {
  const startTime = Date.now();
  const TENANT_ID = await resolveTenantId();

  try {
    // 1. Carregar contexto da Pousada/Propriedade
    const property = await db.property.findFirst({
      where: { tenantId: TENANT_ID }
    });

    // 2. Carregar informações de quartos (rooms)
    const rooms = await db.room.findMany({
      where: { propertyId: property?.id || '' }
    });

    // 3. Carregar regras e FAQ da base de conhecimento (knowledge entries)
    const knowledge = await db.knowledgeEntry.findMany({
      where: { tenantId: TENANT_ID }
    });

    // 3.5. Carregar prompts de treinamento ativos (TrainingPrompts)
    const trainingPrompts = await db.trainingPrompt.findMany({
      where: {
        tenantId: TENANT_ID,
        isActive: true
      }
    });

    // 4. Carregar histórico da conversa (últimas 10 mensagens)
    const recentMessages = await db.conversationMessage.findMany({
      where: { conversationId },
      orderBy: { timestamp: 'asc' },
      take: 10
    });

    // 5. Estruturar os dados no System Prompt da IA
    let hotelContext = `
Você é a ZÉLLA, uma assistente virtual de inteligência artificial ultra-atenciosa e hospitaleira da pousada "${property?.name || 'Pousada Serenity'}".
Seu objetivo é sanar dúvidas, encantar o hóspede, sugerir acomodações e incentivar a reserva direta de forma natural, educada e calorosa.

=== INFORMAÇÕES GERAIS DA POUSADA ===
Nome: ${property?.name || 'Pousada Serenity'}
Endereço/Localização: ${property?.city || 'Paraty'}, ${property?.state || 'RJ'}
Descrição/Tom: ${property?.description || 'Um refúgio tranquilo e acolhedor com atendimento de excelência.'}

=== NOSSAS ACOMODAÇÕES (QUARTOS) ===
${rooms.length > 0 
  ? rooms.map(r => `- Quarto: ${r.name || 'Acomodação'} (Capacidade: ${r.capacity} pessoas, Preço base: R$${r.basePrice ?? r.price ?? 'sob consulta'}/diária)`).join('\n')
  : 'Consulte o gerente de reservas para valores de quartos.'}

=== INFORMAÇÕES ADICIONAIS & REGRAS (FAQ) ===
${knowledge.length > 0
  ? knowledge.map(k => `- Pergunta/Tópico: ${k.question}\n  Resposta: ${k.answer}`).join('\n')
  : 'Check-in padrão a partir das 14h, check-out até às 12h. Café da manhã artesanal incluso.'}

=== DIRETRIZES DE COMUNICAÇÃO ===
1. Responda de forma concisa e objetiva (máximo de 3 parágrafos curtos). Mensagens de WhatsApp muito longas cansam o hóspede.
2. Seja hospitaleira, use emojis de forma moderada e profissional.
3. Se o hóspede perguntar preços, apresente as opções de quartos disponíveis e pergunte a data desejada e quantidade de pessoas para refinar a cotação.
4. Responda SEMPRE in português do Brasil de forma natural.
5. Se for perguntado algo sobre o qual você não tem contexto ou informação no prompt, seja honesta e diga que vai verificar com o atendente humano, deixando a conversa em aberto.
6. Nunca invente informações que não estejam listadas nos quartos ou no FAQ acima.
`;

    if (trainingPrompts.length > 0) {
      hotelContext += `\n=== DIRETRIZES ADICIONAIS DE TREINAMENTO ===\n`;
      for (const prompt of trainingPrompts) {
        hotelContext += `[${prompt.type.toUpperCase()}] ${prompt.content}\n`;
      }
    }

    // 6. Estruturar o histórico para a IA
    let historyPrompt = 'Abaixo está o histórico recente de interações com este hóspede:\n';
    
    for (const msg of recentMessages) {
      const senderName = msg.from === 'guest' ? 'Hóspede' : msg.from === 'ai' ? 'ZÉLLA (IA)' : 'Atendente Humano';
      historyPrompt += `\n[${senderName}]: ${msg.content}`;
    }

    historyPrompt += `\n\n[Hóspede] (última mensagem recebida): ${lastMessageContent}\n\nZÉLLA (IA):`;

    // 7. Invocar a IA do ZaosNeuroRouter
    const router = await getNeuroRouter();
    const aiResponse = await router.generate({
      message: historyPrompt,
      systemPrompt: hotelContext,
      sessionId: conversationId,
      tier: 2 // Usar tier 2 (Gemini Flash / Mid-tier) para respostas rápidas e eficientes no WhatsApp
    });

    const responseText = aiResponse.response;
    const latency = Date.now() - startTime;

    // 8. Salvar a resposta da IA como uma mensagem em ConversationMessage
    const savedMessage = await db.conversationMessage.create({
      data: {
        conversationId,
        from: 'ai',
        content: responseText,
        metadata: JSON.stringify({
          latencyMs: latency,
          providerUsed: aiResponse.providerId,
          tierUsed: aiResponse.tier
        })
      }
    });

    // 9. Atualizar o ConversationLog com confiança da IA e tempo
    const confidencePct = Math.round((aiResponse.confidence || 0.85) * 100);
    await db.conversationLog.update({
      where: { id: conversationId },
      data: {
        lastUpdate: new Date(),
        aiConfidence: confidencePct
      }
    });

    // 10. Gravar no AIActivityLog o sucesso da resposta
    await db.aIActivityLog.create({
      data: {
        tenantId: TENANT_ID,
        type: 'message',
        message: `IA respondeu em background (${latency}ms, Confiança: ${confidencePct}%)`,
        status: 'success',
        duration: latency,
        metadata: JSON.stringify({
          messageId: savedMessage.id,
          provider: aiResponse.providerId,
          costUsd: aiResponse.costUsd
        })
      }
    });

    // 11. Enviar mensagem física ao WhatsApp
    const guest = await db.guest.findUnique({
      where: { id: guestId }
    });

    if (guest && guest.phone) {
      const sendResult = await sendWhatsAppMessage(guest.phone, responseText);
      
      if (sendResult.success) {
        // Atualizar metadados da mensagem se o envio físico gerou ID real do WhatsApp
        if (sendResult.messageId && !sendResult.isMock) {
          await db.conversationMessage.update({
            where: { id: savedMessage.id },
            data: {
              metadata: JSON.stringify({
                latencyMs: latency,
                providerUsed: aiResponse.providerId,
                tierUsed: aiResponse.tier,
                wamid: sendResult.messageId
              })
            }
          });
        }
      } else {
        console.error('[whatsapp-ai-responder] Erro no envio físico do WhatsApp:', sendResult.error);
        
        // Log de erro no envio
        await db.aIActivityLog.create({
          data: {
            tenantId: TENANT_ID,
            type: 'alert',
            message: `Falha ao entregar WhatsApp físico: ${sendResult.error}`,
            status: 'error',
            metadata: JSON.stringify({ guestId, error: sendResult.error })
          }
        });
      }
    }
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error('[whatsapp-ai-responder] Erro crítico ao gerar ou enviar resposta automática da IA:', error);
    
    // Log de erro de processamento
    await db.aIActivityLog.create({
      data: {
        tenantId: TENANT_ID,
        type: 'alert',
        message: `Falha crítica no processamento da resposta da IA: ${error instanceof Error ? error.message : 'Unknown error'}`,
        status: 'error',
        duration: latency,
        metadata: JSON.stringify({ conversationId, guestId })
      }
    });
  }
}
