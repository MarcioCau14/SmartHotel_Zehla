import { prisma } from '@/lib/prisma';
import { checkFinOpsBreaker, logBillingEvent } from '@/lib/finops-breaker';
import * as MiroFish from './mirofish-cache';
import * as LLMRouter from './llm-router';
import { classifyIntent, type ClassifiedIntent } from './intent-classifier';
import { PromptBuilder } from './processors/PromptBuilder';
import { executeTool } from './zehla-tools';

export interface WhatsAppMessageInput {
  tenantId: string;
  guestPhone: string;
  incomingMessage: string;
  pushName?: string;
}

export interface WhatsAppAgentResponse {
  reply: string;
  source: 'MIROFISH_CACHE' | 'KIMI_K2.6' | 'GPT_FALLBACK' | 'LOCAL_FALLBACK' | 'THROTTLED' | 'RULE_BASED';
  intent: string;
  tokensUsed: number;
  cost: number;
  latency: number;
}

/**
 * ProcessWhatsAppMessageUseCase
 * 
 * Orchestrates the full AI response pipeline:
 * 1. FinOps Breaker — validates tenant budget
 * 2. MiroFish Cache — checks for cached responses
 * 3. Intent Classification — understands the message
 * 4. Context Loading — fetches guest + property data
 * 5. Tool Calling — real-time data from DB
 * 6. LLM Generation — Kimi K2.6 or fallback
 * 7. Cache Save — stores response for future
 * 8. Billing Log — tracks cost for FinOps
 */
export async function processWhatsAppMessage(
  input: WhatsAppMessageInput
): Promise<WhatsAppAgentResponse> {
  const startTime = Date.now();
  const { tenantId, guestPhone, incomingMessage, pushName } = input;

  // 1. FINOPS BREAKER — Validate tenant budget before any processing
  const property = await prisma.property.findUnique({
    where: { id: tenantId },
    select: { plan: true, name: true, whatsapp: true, description: true },
  });

  if (!property) {
    return {
      reply: 'Propriedade não encontrada.',
      source: 'RULE_BASED',
      intent: 'UNKNOWN',
      tokensUsed: 0,
      cost: 0,
      latency: Date.now() - startTime,
    };
  }

  const finOpsCheck = await checkFinOpsBreaker(tenantId, property.plan, 'ai_token');
  if (!finOpsCheck.allowed) {
    console.warn(`[FinOps] Blocked AI call for tenant ${tenantId}: ${finOpsCheck.reason}`);
    return {
      reply: 'A nossa recepção está com alta demanda no momento. Por favor, aguarde alguns instantes que retornaremos em breve! 🙏',
      source: 'THROTTLED',
      intent: 'UNKNOWN',
      tokensUsed: 0,
      cost: 0,
      latency: Date.now() - startTime,
    };
  }

  // 2. MIROFISH CACHE — Check for cached response
  const cachedAnswer = await MiroFish.searchSimilar(tenantId, incomingMessage);
  if (cachedAnswer && cachedAnswer.confidence > 0.95) {
    await logBillingEvent(tenantId, 'ai_token', 0, { source: 'MIROFISH_CACHE', intent: 'CACHED' });
    return {
      reply: cachedAnswer.content,
      source: 'MIROFISH_CACHE',
      intent: 'CACHED',
      tokensUsed: 0,
      cost: 0,
      latency: Date.now() - startTime,
    };
  }

  // 3. INTENT CLASSIFICATION
  const classified: ClassifiedIntent = await classifyIntent(incomingMessage);

  // 4. CONTEXT LOADING — Guest history + property data
  const guestContext = await getGuestContext(tenantId, guestPhone);

  // 5. TOOL CALLING — Real-time data for specific intents
  const toolData = await fetchToolData(tenantId, classified.intent);

  // 6. BUILD PROMPTS
  const systemPrompt = await buildSystemPrompt(property, classified, guestContext, toolData);
  const userPrompt = incomingMessage;

  // 7. LLM GENERATION
  let llmResult: { content: string; tokensUsed: number; cost: number; model: string; latency: number };
  let source: WhatsAppAgentResponse['source'];

  try {
    const modelType = classified.intent === 'PRICE_INQUIRY' || classified.intent === 'RESERVATION_CREATE'
      ? 'reasoning'
      : 'general';

    llmResult = await LLMRouter.generate({
      model: modelType,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 1024,
      tenantId,
    });

    source = llmResult.model === 'local_fallback' ? 'LOCAL_FALLBACK'
      : llmResult.model === 'gpt-4o-mini' ? 'GPT_FALLBACK'
      : 'KIMI_K2.6';
  } catch (error) {
    console.error('[WhatsAppAgent] LLM generation failed:', error);
    llmResult = await LLMRouter.generate({
      model: 'general',
      messages: [{ role: 'user', content: incomingMessage }],
    });
    source = 'LOCAL_FALLBACK';
  }

  // 8. CACHE SAVE — Store response for future savings
  await MiroFish.save(tenantId, incomingMessage, llmResult.content, classified.intent, llmResult.tokensUsed);

  // 9. BILLING LOG — Track cost for FinOps
  await logBillingEvent(tenantId, 'ai_token', llmResult.tokensUsed, {
    source,
    intent: classified.intent,
    model: llmResult.model,
    latency: llmResult.latency,
    guestPhone,
  });

  // 10. PERSIST MESSAGE
  await prisma.message.create({
    data: {
      propertyId: tenantId,
      phone: guestPhone,
      name: pushName || guestContext?.name || '',
      content: incomingMessage,
      direction: 'INBOUND',
      type: 'TEXT',
      status: 'READ',
      agentHandled: source,
    },
  });

  await prisma.message.create({
    data: {
      propertyId: tenantId,
      phone: guestPhone,
      name: pushName || guestContext?.name || '',
      content: llmResult.content,
      direction: 'OUTBOUND',
      type: 'TEXT',
      status: 'SENT',
      agentHandled: source,
    },
  });

  return {
    reply: llmResult.content,
    source,
    intent: classified.intent,
    tokensUsed: llmResult.tokensUsed,
    cost: llmResult.cost,
    latency: Date.now() - startTime,
  };
}

/**
 * Fetch guest context from CRM and reservations
 */
async function getGuestContext(tenantId: string, guestPhone: string) {
  try {
    const lastReservation = await prisma.reservation.findFirst({
      where: {
        propertyId: tenantId,
        guestPhone,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        guestName: true,
        guestEmail: true,
        status: true,
        checkIn: true,
        checkOut: true,
        totalAmount: true,
        nights: true,
      },
    });

    return lastReservation || null;
  } catch {
    return null;
  }
}

/**
 * Fetch real-time data via tools based on intent
 */
async function fetchToolData(tenantId: string, intent: string): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysFromNow = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

  try {
    switch (intent) {
      case 'PRICE_INQUIRY':
      case 'RESERVATION_CREATE':
      case 'ROOM_AVAILABILITY':
        results.property = await executeTool('zehla_buscar_dados_property', { pousada_id: tenantId });
        results.occupancy = await executeTool('zehla_analisar_ocupacao', {
          pousada_id: tenantId,
          periodo_inicio: today,
          periodo_fim: thirtyDaysFromNow,
        });
        break;
      case 'CHECK_IN':
      case 'CHECK_OUT':
        results.dailyReport = await executeTool('zehla_gerar_relatorio_diario', {
          pousada_id: tenantId,
          data: today,
        });
        break;
      default:
        results.property = await executeTool('zehla_buscar_dados_property', { pousada_id: tenantId });
    }
  } catch (error) {
    console.warn('[ToolCalling] Failed to fetch tool data:', error);
  }

  return results;
}

/**
 * Build system prompt with property context + guest history + tool data
 */
async function buildSystemPrompt(
  property: any,
  classified: ClassifiedIntent,
  guestContext: any,
  toolData: Record<string, any>
): Promise<string> {
  // Configurações de internacionalização da propriedade
  const locale = property.locale || 'pt-BR';
  const currencyCode = property.currencyCode || 'BRL';
  const timezone = property.timezone || 'America/Sao_Paulo';

  // Mapeamento de idioma para instruções do sistema
  const langConfig: Record<string, { lang: string; greeting: string; rules: string }> = {
    'pt-BR': {
      lang: 'português brasileiro',
      greeting: 'Olá',
      rules: `- Responda em português brasileiro
- Use linguagem cordial e natural (não robótica)
- Trate o hóspede com empatia e profissionalismo
- Use "você" como pronome de tratamento`,
    },
    'es-ES': {
      lang: 'español',
      greeting: 'Hola',
      rules: `- Responde en español
- Usa un lenguaje cordial y natural (no robótico)
- Trata al huésped con empatía y profesionalismo
- Usa "usted" como pronombre de tratamiento`,
    },
    'en-US': {
      lang: 'English',
      greeting: 'Hello',
      rules: `- Respond in English
- Use friendly and natural language (not robotic)
- Treat the guest with empathy and professionalism
- Use "you" as the pronoun`,
    },
  };

  const config = langConfig[locale] || langConfig['pt-BR'];

  // Formatação de datas e valores baseado no locale/timezone
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeZone: timezone,
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    }).format(amount);
  };

  const guestInfo = guestContext
    ? `\n\nGUEST HISTORY:\n- Name: ${guestContext.guestName}\n- Last reservation: ${guestContext.status}\n- Check-in: ${formatDate(guestContext.checkIn)}\n- Check-out: ${formatDate(guestContext.checkOut)}\n- Amount: ${formatCurrency(guestContext.totalAmount)}`
    : '';

  const toolContextBlock = Object.entries(toolData)
    .filter(([, v]) => v && !v.error)
    .map(([k, v]) => {
      try {
        const parsed = typeof v === 'string' ? JSON.parse(v) : v;
        return `[${k}]\n${JSON.stringify(parsed, null, 2)}`;
      } catch {
        return `[${k}]\n${v}`;
      }
    })
    .join('\n\n');

  const dataBlock = toolContextBlock
    ? `\n\n## REAL-TIME DATA\n${toolContextBlock}`
    : '';

  const basePrompt = `You are the AI Concierge of ${property.name}. Your role is to assist guests and potential customers via WhatsApp in a friendly, persuasive, and efficient manner.

RULES:
${config.rules}
- Focus on converting reservation sales
- If you don't know something, say you'll check and get back
- Use emojis moderately
- Keep responses concise (max 3-4 sentences)
- IMPORTANT: Always respond in ${config.lang} — detect the guest's language and adapt accordingly

ABOUT THE PROPERTY:${property.description ? ` ${property.description}` : ''}
${guestInfo}${dataBlock}`;

  return basePrompt;
}
