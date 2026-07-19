// ═══════════════════════════════════════════════════════════════════════════════
// ZCC Pulse Check — AI Analysis Endpoint
// ═══════════════════════════════════════════════════════════════════════════════
// Uses z-ai-web-dev-sdk (LLM skill) to analyze captured errors.
// This is the "Gatilho da IA" — the AI debugging engine.
// ═══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { verifyZCCAccessOrReject } from '@/lib/zcc-security';

const SYSTEM_PROMPT = `Você é o Agente de Infraestrutura Senior do ecossistema Seu Zélla.
Um erro crítico acabou de ser capturado nos containers da VPS Hostinger.

SUA MISSÃO:
Analise o erro e retorne UM OBJETO JSON ESTRITO (sem markdown, sem comentários, sem texto fora do JSON) contendo:

1. "arquivo_linha": Onde o erro ocorreu (arquivo:linha).
2. "severidade": "ALTA", "MÉDIA" ou "BAIXA".
3. "impacto_usuario": O que o hóspede/anfitrião está enfrentando agora por causa disso (1 frase).
4. "causa_raiz": Uma explicação de 1 linha da causa raiz.
5. "codigo_solucao": O snippet de código exato para consertar o bug (comentado em português).
6. "confianca": Número de 0 a 1 representando sua confiança na análise.

RETORNE APENAS O JSON. Nenhum texto adicional.`;

interface AnalysisRequest {
  stackTrace: string;
  errorMessage: string;
  container: string;
  additionalContext?: string;
}

export async function POST(request: NextRequest) {
  // ── Security Gate V3 — 6-Layer Protection ──
  const security = await verifyZCCAccessOrReject(request);
  if (!security.allowed) return security.response!;

  try {
    const body: AnalysisRequest = await request.json();

    if (!body.stackTrace || !body.errorMessage) {
      return NextResponse.json(
        { error: 'MISSING_FIELDS', message: 'stackTrace and errorMessage are required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const userMessage = `**[DADOS DO ERRO]:**
Container: ${body.container}
Mensagem: ${body.errorMessage}
${body.additionalContext ? `Contexto adicional: ${body.additionalContext}` : ''}

**[STACK TRACE]:**
${body.stackTrace}

Analise este erro e retorne o JSON de diagnóstico.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      thinking: { type: 'disabled' },
    });

    const rawResponse = completion.choices[0]?.message?.content || '';

    // Try to parse the JSON response
    let analysis;
    try {
      // Extract JSON from possible markdown code blocks
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: rawResponse };
    } catch {
      analysis = { raw: rawResponse, parseError: true };
    }

    return NextResponse.json({
      success: true,
      analysis: {
        ...analysis,
        container: body.container,
        analyzedAt: new Date().toISOString(),
        tokensUsed: completion.usage?.total_tokens || 0,
      },
    });
  } catch (error) {
    console.error('[Pulse Analyze] Error:', error);
    return NextResponse.json(
      { error: 'ANALYSIS_FAILED', message: 'AI analysis failed', detail: String(error) },
      { status: 500 }
    );
  }
}
