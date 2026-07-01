import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { processIncomingMessage } from '@/lib/whatsapp-ai-responder';
import { resolveTenantByPhone } from '@/lib/resolve-tenant-by-phone';

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

    const message = value.messages?.[0];
    if (!message) {
      // Pode ser um status update (sent, delivered, read), apenas ignorar silenciosamente
      return NextResponse.json({ status: 'ok', processed: 0, reason: 'status_update' });
    }

    const fromPhone = message.from;
    const messageType = message.type;
    const displayPhoneNumber = value.metadata?.display_phone_number || '';

    // Tratar somente mensagens de texto. Outros tipos de mensagem são ignorados no momento
    if (messageType !== 'text') {
      console.warn(`[whatsapp-webhook] Tipo de mensagem não suportado: ${messageType}. Ignorando.`);
      return NextResponse.json({ status: 'ok', processed: 0, reason: 'unsupported_message_type' });
    }

    const messageText = message.text?.body || '';

    // Resolver Tenant com base no número receptor da pousada
    const tenantId = await resolveTenantByPhone(displayPhoneNumber);

    if (!tenantId) {
      console.warn(`[whatsapp-webhook] Nenhum Tenant ativo encontrado para o telefone destinatário: ${displayPhoneNumber}`);
      return NextResponse.json({ status: 'ignored', reason: 'no_tenant_resolved' });
    }

    // Disparar o pipeline completo de forma assíncrona (fire-and-forget) para responder à Meta imediatamente
    processIncomingMessage({
      tenantId,
      guestPhone: fromPhone,
      guestName: contactName,
      messageContent: messageText,
      messageFrom: 'whatsapp'
    }).catch((err) => {
      console.error('[whatsapp-webhook] Erro crítico ao processar mensagem no pipeline:', err);
    });

    return NextResponse.json({ success: true, processed: true });
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
