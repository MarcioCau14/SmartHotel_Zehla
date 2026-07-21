import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'crypto';
import { db } from '@/lib/db';
import { META_VERIFY_TOKEN, META_APP_SECRET } from '@/lib/env';
import { processIncomingMessage } from '@/lib/whatsapp-ai-responder';
import { bufferMessage } from '@/lib/message-bundler';
import { sendWhatsAppMessage } from '@/lib/whatsapp-send';

/* eslint-disable @typescript-eslint/no-unused-vars -- Meta payload types kept as documentation */

// ═══════════════════════════════════════════════════════════════
// META WHATSAPP BUSINESS API — WEBHOOK ENDPOINT
// Rota receptora de eventos da Meta Cloud API.
// ───────────────────────────────────────────────────────────
// GET  → Verificação do Webhook (Meta onboarding flow)
// POST → Recepção de mensagens + isolamento multi-tenant
// ═══════════════════════════════════════════════════════════════

// ── Types: Meta WhatsApp Payload ───────────────────────────────
// O payload da Meta é profundamente aninhado. Estes tipos
// fazem o parse seguro sem vazamento de tipagem.

interface MetaWebhookEntry {
  id: string;
  changes: MetaWebhookChange[];
}

interface MetaWebhookChange {
  field: string;
  value: MetaWebhookValue;
}

interface MetaWebhookValue {
  messaging_product?: string;
  metadata?: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: MetaContact[];
  messages?: MetaMessage[];
  statuses?: MetaStatus[];
  errors?: Array<{ code: number; title: string; message: string }>;
}

interface MetaContact {
  wa_id: string; // Número de origem (E.164 sem +)
  profile?: {
    name?: string;
  };
}

interface MetaMessage {
  from: string; // Número de origem (E.164 sem +)
  id: string; // Message ID (wamid.HKLM...)
  timestamp: string; // Unix timestamp
  type: string; // text | image | document | audio | video | location | contacts | sticker | interactive | template | reaction
  text?: { body: string; preview_url?: boolean };
  image?: { id: string; caption?: string; mime_type?: string; sha256?: string };
  document?: { id: string; caption?: string; filename?: string; mime_type?: string; sha256?: string };
  audio?: { id: string; mime_type?: string; sha256?: string; voice?: boolean };
  video?: { id: string; caption?: string; mime_type?: string; sha256?: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  sticker?: { id: string; mime_type?: string; animated?: boolean };
  interactive?: {
    type?: string;
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  context?: { id: string; forwarded?: boolean; frequently_forwarded?: boolean };
  referral?: { source_url?: string; source_id?: string; source_type?: string; headline?: string; body?: string };
  reaction?: { message_id: string; emoji: string };
}

interface MetaStatus {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted' | 'undelivered';
  timestamp: string;
  recipient_id: string;
  errors?: Array<{ code: number; title: string; message: string; error_data?: { details: string } }>;
  conversation?: {
    id: string;
    origin?: { type: string };
    expiration_timestamp?: number;
  };
  pricing?: {
    billable: boolean;
    pricing_model: string;
    category: string;
    cost?: number;
  };
}

// ── Parsed Message (interno) ──────────────────────────────────

interface ParsedIncomingMessage {
  /** Número de origem (quem enviou, E.164 sem +) */
  from: string;
  /** Nome do contato (se disponível) */
  contactName: string | null;
  /** ID da mensagem na Meta */
  messageId: string;
  /** Timestamp Unix */
  timestamp: number;
  /** Tipo da mensagem */
  type: string;
  /** Conteúdo textual (para mensagens de texto) */
  textContent: string | null;
  /** Número de destino (o número da pousada/propriedade, E.164 sem +) */
  destinationNumber: string;
  /** Phone Number ID na Meta */
  phoneNumberId: string;
  /** WABA ID */
  wabaId: string;
}

// ── HMAC Signature Verification ───────────────────────────────

function verifyMetaSignature(
  payload: string,
  signatureHeader: string | null
): boolean {
  if (!META_APP_SECRET) {
    console.warn('[WhatsApp Webhook] ⚠️ META_APP_SECRET not set — skipping signature verification (dev mode)');
    return true; // Dev mode: skip verification
  }

  if (!signatureHeader) {
    console.error('[WhatsApp Webhook] ❌ No X-Hub-Signature-256 header present');
    return false;
  }

  // Format: "sha256=<hex>"
  const parts = signatureHeader.split('=');
  if (parts.length !== 2 || parts[0] !== 'sha256') {
    console.error('[WhatsApp Webhook] ❌ Invalid signature format:', signatureHeader.substring(0, 20));
    return false;
  }

  const expectedSig = parts[1];
  const computedSig = createHmac('sha256', META_APP_SECRET)
    .update(payload)
    .digest('hex');

  try {
    const expected = Buffer.from(expectedSig, 'hex');
    const computed = Buffer.from(computedSig, 'hex');

    if (expected.length !== computed.length) {
      console.error('[WhatsApp Webhook] ❌ Signature length mismatch');
      return false;
    }

    return timingSafeEqual(expected, computed);
  } catch {
    console.error('[WhatsApp Webhook] ❌ Signature comparison error');
    return false;
  }
}

// ── Safe Payload Parser ───────────────────────────────────────
// Faz o parse seguro do JSON aninhado da Meta sem vazamento
// de tipagem. Qualquer campo faltante resulta em null seguro.

function parseIncomingMessages(rawBody: unknown): ParsedIncomingMessage[] {
  const results: ParsedIncomingMessage[] = [];

  // Level 1: entry[]
  const body = rawBody as Record<string, unknown> | null;
  if (!body?.object || body.object !== 'whatsapp_business_account') {
    return results;
  }

  const entries = Array.isArray(body.entry) ? body.entry : [];

  for (const entry of entries) {
    const e = entry as Record<string, unknown>;
    const wabaId = (e.id as string) || '';
    const changes = Array.isArray(e.changes) ? e.changes : [];

    for (const change of changes) {
      const c = change as Record<string, unknown>;
      if (c.field !== 'messages') continue;

      const value = c.value as Record<string, unknown> | null;
      if (!value) continue;

      // Extract metadata (destination number)
      const metadata = value.metadata as Record<string, unknown> | null;
      const destinationNumber = (metadata?.display_phone_number as string) || '';
      const phoneNumberId = (metadata?.phone_number_id as string) || '';

      // Extract contacts map
      const contacts = Array.isArray(value.contacts) ? value.contacts : [];
      const contactMap = new Map<string, string | null>();
      for (const contact of contacts) {
        const ct = contact as Record<string, unknown>;
        const waId = (ct.wa_id as string) || '';
        const profile = ct.profile as Record<string, unknown> | null;
        const name = (profile?.name as string) || null;
        contactMap.set(waId, name);
      }

      // Extract messages
      const messages = Array.isArray(value.messages) ? value.messages : [];

      for (const msg of messages) {
        const m = msg as Record<string, unknown>;

        // Extract text content
        let textContent: string | null = null;
        if (m.type === 'text' && m.text) {
          const textObj = m.text as Record<string, unknown>;
          textContent = (textObj.body as string) || null;
        }

        results.push({
          from: (m.from as string) || '',
          contactName: contactMap.get((m.from as string) || '') || null,
          messageId: (m.id as string) || '',
          timestamp: Number(m.timestamp) || 0,
          type: (m.type as string) || 'unknown',
          textContent,
          destinationNumber,
          phoneNumberId,
          wabaId,
        });
      }
    }
  }

  return results;
}

// ── Tenant Lookup by WhatsApp Number ──────────────────────────

interface TenantLookupResult {
  found: boolean;
  tenantId: string | null;
  tenantName: string | null;
  tenantStatus: string | null;
  tenantPlan: string | null;
  niche: string | null;
  reason?: string;
}

async function findTenantByWhatsAppNumber(
  destinationNumber: string,
  wabaId?: string
): Promise<TenantLookupResult> {
  try {
    // Strategy 1: Lookup by whatsappPhoneNumber (E.164 format)
    // We try multiple formats: with +, without +, with spaces, etc.
    const normalizedNumber = destinationNumber.replace(/\D/g, ''); // Strip non-digits

    const candidates = [
      `+${normalizedNumber}`,  // +5521999998888
      normalizedNumber,         // 5521999998888
      destinationNumber,        // original
    ];

    // Try to find by whatsappPhoneNumber first
    for (const candidate of candidates) {
      const tenant = await db.tenant.findFirst({
        where: { whatsappPhoneNumber: candidate },
        select: {
          id: true,
          name: true,
          status: true,
          plan: true,
          niche: true,
          whatsappBusinessId: true,
        },
      });

      if (tenant) {
        return {
          found: true,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantStatus: tenant.status,
          tenantPlan: tenant.plan,
          niche: tenant.niche,
        };
      }
    }

    // Strategy 2: If WABA ID provided, try lookup by whatsappBusinessId
    if (wabaId) {
      const tenant = await db.tenant.findFirst({
        where: { whatsappBusinessId: wabaId },
        select: {
          id: true,
          name: true,
          status: true,
          plan: true,
          niche: true,
        },
      });

      if (tenant) {
        return {
          found: true,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantStatus: tenant.status,
          tenantPlan: tenant.plan,
          niche: tenant.niche,
        };
      }
    }

    // Strategy 3: Fallback — try phoneAlt field (legacy)
    for (const candidate of candidates) {
      const tenant = await db.tenant.findFirst({
        where: { phoneAlt: candidate },
        select: {
          id: true,
          name: true,
          status: true,
          plan: true,
          niche: true,
        },
      });

      if (tenant) {
        return {
          found: true,
          tenantId: tenant.id,
          tenantName: tenant.name,
          tenantStatus: tenant.status,
          tenantPlan: tenant.plan,
          niche: tenant.niche,
        };
      }
    }

    return {
      found: false,
      tenantId: null,
      tenantName: null,
      tenantStatus: null,
      tenantPlan: null,
      niche: null,
      reason: `No tenant found for WhatsApp number: ${destinationNumber}`,
    };
  } catch (error) {
    console.error('[WhatsApp Webhook] ❌ Tenant lookup error:', error);
    return {
      found: false,
      tenantId: null,
      tenantName: null,
      tenantStatus: null,
      tenantPlan: null,
      niche: null,
      reason: 'Database error during tenant lookup',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
// GET — Meta Webhook Verification
// ═══════════════════════════════════════════════════════════════
// A Meta envia um GET com hub.mode=subscribe e hub.verify_token
// quando o webhook é configurado no App Dashboard.
// Devolvemos o hub.challenge para confirmar a posse.

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('[WhatsApp Webhook] GET verification request:', {
    mode,
    token: token ? '***present***' : '***missing***',
    challenge: challenge ? '***present***' : '***missing***',
  });

  // ── Validate mode ──────────────────────────────────────
  if (mode !== 'subscribe') {
    console.warn('[WhatsApp Webhook] ❌ Invalid hub.mode:', mode);
    return NextResponse.json(
      { error: 'Invalid mode. Expected "subscribe".' },
      { status: 403 }
    );
  }

  // ── Validate verify token ──────────────────────────────
  if (!META_VERIFY_TOKEN) {
    console.error('[WhatsApp Webhook] ❌ META_VERIFY_TOKEN not configured');
    return NextResponse.json(
      { error: 'Webhook verification not configured.' },
      { status: 500 }
    );
  }

  if (token !== META_VERIFY_TOKEN) {
    console.warn('[WhatsApp Webhook] ❌ Token mismatch. Expected vs received differ.');
    return NextResponse.json(
      { error: 'Verification token mismatch.' },
      { status: 403 }
    );
  }

  // ── Return challenge ───────────────────────────────────
  if (!challenge) {
    console.warn('[WhatsApp Webhook] ❌ No hub.challenge provided');
    return NextResponse.json(
      { error: 'Missing hub.challenge.' },
      { status: 400 }
    );
  }

  console.log('[WhatsApp Webhook] ✅ Webhook verified successfully');

  // Meta requires the challenge to be returned as plain text or number
  return new NextResponse(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

// ═══════════════════════════════════════════════════════════════
// POST — Meta Message Reception + Multi-Tenant Isolation
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  // ── Step 1: Verify HMAC Signature ──────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');

  if (!verifyMetaSignature(rawBody, signature)) {
    console.error('[WhatsApp Webhook] ❌ Invalid signature — possible tampering');
    // Return 200 to avoid Meta retries, but log the issue
    return NextResponse.json({ status: 'rejected' }, { status: 200 });
  }

  // ── Step 2: Parse the payload safely ───────────────────
  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    console.error('[WhatsApp Webhook] ❌ Invalid JSON payload');
    return NextResponse.json({ status: 'invalid_json' }, { status: 400 });
  }

  // ── Step 3: Extract incoming messages ──────────────────
  const messages = parseIncomingMessages(parsedBody);

  if (messages.length === 0) {
    // Could be a status update or other non-message event — acknowledge silently
    const processingTime = Date.now() - startTime;
    console.log(`[WhatsApp Webhook] 📋 Non-message event acknowledged (${processingTime}ms)`);
    return NextResponse.json({ status: 'acknowledged' }, { status: 200 });
  }

  console.log(`[WhatsApp Webhook] 📨 Received ${messages.length} message(s)`);

  // ── Step 4: Multi-Tenant Isolation ─────────────────────
  // Para cada mensagem, roteamos para o Tenant correto
  // usando o número de destino como chave de isolamento.

  const processingResults: Array<{
    messageId: string;
    from: string;
    destination: string;
    tenantFound: boolean;
    tenantId: string | null;
    accepted: boolean;
    reason?: string;
  }> = [];

  for (const msg of messages) {
    console.log(`[WhatsApp Webhook] 📨 Processing message from ${msg.from} → ${msg.destinationNumber} (type: ${msg.type})`);

    // Lookup tenant by destination number
    const lookup = await findTenantByWhatsAppNumber(msg.destinationNumber, msg.wabaId);

    if (!lookup.found) {
      // ── Tenant not found → silent discard ──────────
      // Return HTTP 200 to Meta (don't trigger retry)
      // but log clearly for development debugging
      console.warn(
        `[WhatsApp Webhook] ⚠️ SILENT DISCARD — No tenant for number ${msg.destinationNumber}` +
        ` | from: ${msg.from} | msgId: ${msg.messageId}` +
        ` | reason: ${lookup.reason || 'unknown'}`
      );

      processingResults.push({
        messageId: msg.messageId,
        from: msg.from,
        destination: msg.destinationNumber,
        tenantFound: false,
        tenantId: null,
        accepted: false,
        reason: lookup.reason,
      });

      continue; // Skip processing for this message
    }

    // ── Tenant found → check subscription status ─────
    if (lookup.tenantStatus === 'suspended' || lookup.tenantStatus === 'churned') {
      console.warn(
        `[WhatsApp Webhook] ⚠️ SILENT DISCARD — Tenant "${lookup.tenantName}" (${lookup.tenantId})` +
        ` is ${lookup.tenantStatus} | from: ${msg.from} | msgId: ${msg.messageId}`
      );

      processingResults.push({
        messageId: msg.messageId,
        from: msg.from,
        destination: msg.destinationNumber,
        tenantFound: true,
        tenantId: lookup.tenantId,
        accepted: false,
        reason: `Tenant status: ${lookup.tenantStatus}`,
      });

      continue; // Skip processing
    }

    // ── Plan check — GRATUITO plan cannot receive real messages ──
    if (lookup.tenantPlan === 'gratuito') {
      console.warn(
        `[WhatsApp Webhook] ⚠️ SILENT DISCARD — Tenant "${lookup.tenantName}" (${lookup.tenantId})` +
        ` is on GRATUITO plan — real WhatsApp integration requires LITE+` +
        ` | from: ${msg.from} | msgId: ${msg.messageId}`
      );

      processingResults.push({
        messageId: msg.messageId,
        from: msg.from,
        destination: msg.destinationNumber,
        tenantFound: true,
        tenantId: lookup.tenantId,
        accepted: false,
        reason: 'GRATUITO plan — upgrade required',
      });

      continue;
    }

    // ── Tenant is active and on a paid plan → PROCESS ──
    console.log(
      `[WhatsApp Webhook] ✅ ACCEPTED — Tenant "${lookup.tenantName}" (${lookup.tenantId})` +
      ` | niche: ${lookup.niche} | plan: ${lookup.tenantPlan}` +
      ` | from: ${msg.from} (${msg.contactName || 'unknown'})` +
      ` | type: ${msg.type}` +
      ` | text: ${msg.textContent ? `"${msg.textContent.substring(0, 80)}${msg.textContent.length > 80 ? '...' : ''}"` : '(non-text)'}`
    );

    // ── Route message through AI pipeline (async, fire-and-forget) ──
    // Never await AI processing in the webhook handler — Meta requires
    // a fast HTTP 200 response and will retry if we block.
    const tenantId = lookup.tenantId!; // Guaranteed non-null after checks above

    if (msg.type === 'text' && msg.textContent) {
      // ── Text message → buffer, process through AI, send response ──
      const guestPhone = msg.from;
      const guestName = msg.contactName || undefined;
      const messageContent = msg.textContent;

      bufferMessage(
        {
          tenantId,
          guestPhone,
          guestName,
          messageContent,
          messageFrom: 'whatsapp',
        },
        async (payload) => {
          const result = await processIncomingMessage({
            tenantId: payload.tenantId,
            guestPhone: payload.guestPhone,
            guestName: payload.guestName,
            messageContent: payload.messageContent,
            messageFrom: payload.messageFrom,
          });

          if (result.aiResponse) {
            const sendResult = await sendWhatsAppMessage(guestPhone, result.aiResponse);
            if (!sendResult.success) {
              console.error(
                `[WhatsApp Webhook] ❌ Failed to send AI response to ${guestPhone}: ${sendResult.error}`
              );
            }
          }
        }
      ).catch((err) => {
        console.error(
          `[WhatsApp Webhook] ❌ Error in AI pipeline for tenant ${tenantId}, guest ${guestPhone}:`,
          err
        );
      });
    } else {
      // ── Non-text message → log and record media entry, no AI processing ──
      const mediaNote = `[Mídia recebida: ${msg.type}]`;
      console.log(
        `[WhatsApp Webhook] 📎 Non-text message from ${msg.from} (type: ${msg.type}) — recording media entry`
      );

      // Fire-and-forget: resolve guest, find/create conversation, save message
      (async () => {
        try {
          const { resolveGuest } = await import('@/lib/bsuid-resolver');
          const guest = await resolveGuest(tenantId, {
            phone: msg.from,
            profileName: msg.contactName || undefined,
          });

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
                guestPhone: msg.from,
                status: 'active',
                aiConfidence: 0,
                metadata: '{}',
              },
            });
          }

          await db.conversationMessage.create({
            data: {
              conversationId: conversation.id,
              from: 'guest',
              content: mediaNote,
              metadata: JSON.stringify({
                mediaType: msg.type,
                originalMessageId: msg.messageId,
              }),
            },
          });
        } catch (err) {
          console.error(
            `[WhatsApp Webhook] ❌ Error recording non-text message from ${msg.from}:`,
            err
          );
        }
      })();
    }

    processingResults.push({
      messageId: msg.messageId,
      from: msg.from,
      destination: msg.destinationNumber,
      tenantFound: true,
      tenantId: lookup.tenantId,
      accepted: true,
    });
  }

  // ── Summary Logging ────────────────────────────────────
  const accepted = processingResults.filter((r) => r.accepted).length;
  const discarded = processingResults.filter((r) => !r.accepted).length;
  const processingTime = Date.now() - startTime;

  console.log(
    `[WhatsApp Webhook] 📊 Batch complete: ${accepted} accepted, ${discarded} discarded` +
    ` | ${processingTime}ms | ${messages.length} total messages`
  );

  // Always return 200 to Meta — never trigger retries
  return NextResponse.json(
    {
      status: 'processed',
      summary: {
        total: messages.length,
        accepted,
        discarded,
        processingTimeMs: processingTime,
      },
    },
    {
      status: 200,
      headers: {
        'X-Security-Shield': 'zero-trust-v2',
        'X-Processing-Time': `${processingTime}ms`,
      },
    }
  );
}
