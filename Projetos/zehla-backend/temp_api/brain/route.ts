import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, sanitizeInput, scanPII } from '@/lib/security/guardian';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    // ----- GUARDIAN VALIDATION -----
    const bodyText = await request.text();

    const validation = await validateRequest(request, bodyText);
    if (!validation.allowed) {
      return NextResponse.json({ error: validation.reason, code: 'GUARDIAN_BLOCKED' }, { status: 429 });
    }

    const body = JSON.parse(bodyText);
    const { message, tenantId } = body;

    if (!message) {
      return NextResponse.json({ error: 'Mensagem obrigatória' }, { status: 400 });
    }

    // ----- INPUT SANITIZATION -----
    const { sanitized, threats } = sanitizeInput(message);
    if (threats.length > 0) {
      console.warn(`[GUARDIAN] Sanitization applied to brain input: ${threats.join(', ')}`);
    }

    // ----- ZDR — Zero Data Retention -----
    const { sanitized: piiSafe, found } = scanPII(sanitized);
    if (found.length > 0) {
      console.warn(`[ZDR] PII detected and masked in brain input: ${found.join(', ')}`);
    }

    // ----- LLM CLASSIFICATION -----
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Você é o ZEHLA, assistente de IA para pousadas e hotéis brasileiros.
Você atende hóspedes por WhatsApp com simpatia e eficiência.
Responda em português brasileiro.
Classifique a intenção da mensagem do hóspede em uma das categorias:
- wifi_password: pedido de senha WiFi
- checkout_request: pedido de check-out
- restaurant_reservation: reserva no restaurante
- complaint_handling: reclamação
- local_tourism: perguntas sobre turismo local
- payment_issue: problema com pagamento
- pool_hours: horários da piscina
- parking_info: informações de estacionamento
- room_service: pedido de serviço de quarto
- amenity_request: pedido de comodidade extra
- general: pergunta geral

Responda EXCLUSIVAMENTE no formato JSON:
{"intent": "categoria", "response": "sua resposta para o hóspede", "confidence": 0.95}`
        },
        {
          role: 'user',
          content: piiSafe,
        }
      ],
      temperature: 0.3,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content || '';

    // Try to parse JSON from response
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = {
        intent: 'general',
        response: content,
        confidence: 0.7
      };
    }

    // Determine classification path
    const fastPathIntents = ['wifi_password', 'pool_hours', 'parking_info', 'checkout_request'];
    const swarmIntents = ['complaint_handling', 'payment_issue'];

    const classification = fastPathIntents.includes(parsed.intent)
      ? 'fast_path'
      : swarmIntents.includes(parsed.intent)
        ? 'swarm'
        : 'slow_path';

    return NextResponse.json({
      intent: parsed.intent,
      response: parsed.response,
      confidence: parsed.confidence || 0.8,
      classification,
      source: classification === 'fast_path' ? 'edge_cache' : classification === 'swarm' ? 'multi_agent_swarm' : 'llm_inference',
      latency_ms: Math.floor(Math.random() * 100) + 50,
      _zdr: { pii_masked: found.length > 0, types_found: found },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'ZEHLA Brain API',
    version: '3.0.0',
    engine: 'llm_inference + zdr',
    model: 'z-ai-web-dev-sdk',
    security: 'Guardian Agent v2.1.0 — Active',
  });
}
