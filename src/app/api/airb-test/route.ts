import { NextRequest, NextResponse } from 'next/server';
import {
  processAirBMessage,
  SAMPLE_AIRBNB_CONTEXT,
  classifyAirBIntent,
  buildAirBSystemPrompt,
  buildAirBUserPrompt,
  ZellaAirBStrategy,
  type AirBIntent,
  type OperatingMode,
} from '@/lib/strategies/ZellaAirBStrategy';

/**
 * API de teste da prova de conceito Zélla AirB.
 *
 * NÃO toca em nenhum arquivo existente do Zélla Pousada.
 * Testa isoladamente: classificação de intenção, prompt builder, e tools.
 *
 * Endpoints:
 *   POST /api/airb-test  → Processa uma mensagem como o Zélla AirB
 *   GET  /api/airb-test  → Retorna o contexto de exemplo e as intents
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = body as { message: string; context?: typeof SAMPLE_AIRBNB_CONTEXT };

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Campo "message" é obrigatório' },
        { status: 400 }
      );
    }

    // Usa o contexto fornecido ou o de exemplo
    const propertyContext = context || SAMPLE_AIRBNB_CONTEXT;

    // Processa a mensagem
    const result = await processAirBMessage(message, propertyContext);

    return NextResponse.json({
      success: true,
      mode: 'airbnb' as OperatingMode,
      input: message,
      classification: {
        intent: result.intent,
        confidence: result.confidence,
      },
      prompts: {
        system: result.systemPrompt,
        user: result.userPrompt,
      },
      toolResults: result.toolResults,
      readyForLLM: result.readyForLLM,
    });
  } catch (error) {
    console.error('[airb-test] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Retorna informações sobre a Strategy para exploração
  const strategy = new ZellaAirBStrategy();

  // Testa todas as intents com mensagens de exemplo
  const testMessages = [
    { message: 'Cheguei! Como faço pra entrar?', expectedIntent: 'SELF_CHECK_IN' },
    { message: 'Qual a senha do wifi?', expectedIntent: 'WIFI_INFO' },
    { message: 'Posso ter visita?', expectedIntent: 'HOUSE_RULES' },
    { message: 'Como liga o ar do quarto?', expectedIntent: 'EQUIPMENT_HELP' },
    { message: 'Tem padaria perto?', expectedIntent: 'NEIGHBORHOOD_TIPS' },
    { message: 'Onde estaciono?', expectedIntent: 'PARKING_INFO' },
    { message: 'Vazou água na cozinha!', expectedIntent: 'EMERGENCY' },
    { message: 'Oi!', expectedIntent: 'HOST_GREETING' },
    { message: 'Obrigado por tudo!', expectedIntent: 'HOST_FAREWELL' },
    { message: 'Posso ficar mais um dia?', expectedIntent: 'EXTEND_STAY' },
    { message: 'Preciso de toalhas limpas', expectedIntent: 'CLEANING_REQUEST' },
    { message: 'O chuveiro não esquenta', expectedIntent: 'MAINTENANCE_ISSUE' },
    { message: 'O que fazer por aqui?', expectedIntent: 'LOCAL_RECOMMENDATION' },
    { message: 'Quero falar com o dono', expectedIntent: 'HUMAN_HANDOVER' },
    { message: 'Quanto custa a diária?', expectedIntent: 'UNKNOWN' }, // Sem preço no AirB!
  ] as const;

  const classificationResults = testMessages.map(({ message, expectedIntent }) => {
    const result = classifyAirBIntent(message);
    return {
      message,
      expectedIntent,
      classifiedIntent: result.intent,
      confidence: result.confidence,
      method: result.method,
      correct: result.intent === expectedIntent,
    };
  });

  return NextResponse.json({
    mode: strategy.mode,
    shouldIncludeSalesCTA: strategy.shouldIncludeSalesCTA(),
    sampleContext: {
      name: SAMPLE_AIRBNB_CONTEXT.name,
      type: SAMPLE_AIRBNB_CONTEXT.type,
      city: SAMPLE_AIRBNB_CONTEXT.city,
      hostKnowledgeCount: SAMPLE_AIRBNB_CONTEXT.hostKnowledge.length,
      neighborhoodTipsCount: SAMPLE_AIRBNB_CONTEXT.neighborhoodTips.length,
      equipmentCount: SAMPLE_AIRBNB_CONTEXT.equipment.length,
    },
    classificationTests: classificationResults,
    accuracy: classificationResults.filter(r => r.correct).length / classificationResults.length,
  });
}
