import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { respondToWhatsAppMessage } from '@/lib/whatsapp-ai-responder';

const TENANT_ID = 'client-001';

/**
 * GET Handler para verificação de webhook exigida pela Meta Developer Platform.
 * Facebook envia parâmetros query para validar o token.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('hub.mode');
    const token = searchParams.get('hub.verify_token');
    const challenge = searchParams.get('hub.challenge');

    const localVerifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'zehla_whatsapp_verify_2024';

    if (mode && token) {
      if (mode === 'subscribe' && token === localVerifyToken) {
        console.log('[whatsapp-webhook] Validado com sucesso!');
        return new Response(challenge, {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
      console.warn('[whatsapp-webhook] Token de verificação incorreto ou inválido.');
      return new Response('Forbidden', { status: 403 });
    }
    
    console.warn('[whatsapp-webhook] Parâmetros hub.mode ou hub.verify_token ausentes no GET.');
    return new Response('Bad Request', { status: 400 });
  } catch (error) {
    console.error('[whatsapp-webhook-error] Erro no GET de verificação:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

/**
 * POST Handler para receber mensagens em tempo real da API oficial do WhatsApp Cloud.
 * Trata o recebimento, atualiza o Guest, ConversationLog, cria ConversationMessage e lança alertas.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    // Ignorar payloads de validação ou de outros objetos do Facebook
    if (payload.object !== 'whatsapp_business_account') {
      return NextResponse.json({ status: 'ignored', reason: 'non_whatsapp_object' });
    }

    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) {
      return NextResponse.json({ status: 'ignored', reason: 'empty_value' });
    }

    const contact = value.contacts?.[0];
    const contactName = contact?.profile?.name || '';
    const contactWaId = contact?.wa_id || '';

    const message = value.messages?.[0];
    if (!message) {
      // Pode ser um status update (sent, delivered, read), apenas ignorar silenciosamente
      return NextResponse.json({ status: 'ok', processed: 0, reason: 'status_update' });
    }

    const fromPhone = message.from;
    const messageId = message.id;
    const timestamp = parseInt(message.timestamp || '0', 10);
    const messageType = message.type;
    const phoneNumberId = value.metadata?.phone_number_id || '';

    // Tratar somente mensagens de texto. Outros tipos registram erro ou ignoram
    if (messageType !== 'text') {
      console.warn(`[whatsapp-webhook] Tipo de mensagem não suportado: ${messageType}. Ignorando.`);
      
      // Registrar log de auditoria
      await db.aIActivityLog.create({
        data: {
          tenantId: TENANT_ID,
          type: 'alert',
          message: `Mensagem WhatsApp recebida do tipo '${messageType}' (não suportado).`,
          status: 'warning',
          metadata: JSON.stringify({ messageId, from: fromPhone, type: messageType })
        }
      });

      return NextResponse.json({ status: 'ok', processed: 0, reason: 'unsupported_message_type' });
    }

    const messageText = message.text?.body || '';

    // 1. Busca ou cria o Guest com base no telefone
    let guest = await db.guest.findFirst({
      where: {
        tenantId: TENANT_ID,
        phone: fromPhone
      }
    });

    if (!guest) {
      guest = await db.guest.create({
        data: {
          tenantId: TENANT_ID,
          name: contactName || `Hóspede - ${fromPhone}`,
          phone: fromPhone,
          status: 'cold',
          source: 'whatsapp',
          conversationCount: 1,
          metadata: JSON.stringify({ wa_id: contactWaId })
        }
      });
    } else {
      // Incrementa o contador de conversas do hóspede
      await db.guest.update({
        where: { id: guest.id },
        data: {
          conversationCount: { increment: 1 },
          lastContact: new Date()
        }
      });
    }

    // 2. Busca ou cria um ConversationLog ativo para esse hóspede
    let conversation = await db.conversationLog.findFirst({
      where: {
        tenantId: TENANT_ID,
        guestId: guest.id,
        status: 'active'
      }
    });

    if (!conversation) {
      conversation = await db.conversationLog.create({
        data: {
          tenantId: TENANT_ID,
          guestId: guest.id,
          guestName: guest.name,
          guestPhone: fromPhone,
          status: 'active',
          aiConfidence: 0,
          metadata: JSON.stringify({
            whatsapp_phone_number_id: phoneNumberId
          })
        }
      });
    }

    // 3. Grava a mensagem em ConversationMessage (vinculada ao Log)
    const conversationMessage = await db.conversationMessage.create({
      data: {
        conversationId: conversation.id,
        from: 'guest',
        content: messageText,
        metadata: JSON.stringify({
          wamid: messageId,
          whatsappTimestamp: timestamp
        })
      }
    });

    // 4. Atualiza o timestamp de lastUpdate do ConversationLog
    await db.conversationLog.update({
      where: { id: conversation.id },
      data: { lastUpdate: new Date() }
    });

    // 5. Envia notificação para os atendentes humanos no painel
    await db.notification.create({
      data: {
        tenantId: TENANT_ID,
        title: `Nova mensagem WhatsApp — ${guest.name}`,
        message: messageText.length > 60 ? `${messageText.substring(0, 60)}...` : messageText,
        type: 'escalation',
        priority: 'medium',
        read: false,
        actionLabel: 'Ver conversa',
        actionUrl: `/ddc?guest=${guest.id}`
      }
    });

    // 6. Grava auditoria no AIActivityLog
    await db.aIActivityLog.create({
      data: {
        tenantId: TENANT_ID,
        type: 'message',
        message: `Mensagem recebida de ${guest.name}: "${messageText.substring(0, 40)}"`,
        status: 'info',
        metadata: JSON.stringify({
          guestId: guest.id,
          messageId: messageId,
          conversationId: conversation.id
        })
      }
    });

    // 7. [BACKGROUND - fire-and-forget] Disparar resposta automática da IA de forma assíncrona
    // Não usamos await para responder imediatamente HTTP 200 à Meta e evitar timeout
    respondToWhatsAppMessage(conversation.id, guest.id, messageText).catch((err) => {
      console.error('[whatsapp-webhook] Erro ao disparar resposta assíncrona da IA:', err);
    });

    return NextResponse.json({ status: 'ok', processed: 1 });
  } catch (error) {
    console.error('[whatsapp-webhook-error] Erro ao processar mensagem POST:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to process webhook event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
