import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';

import { validateRequest, sanitizeInput, scanPII } from '@/lib/security/guardian';


export async function POST(request: NextRequest) : void {
  try {
    // ----- GUARDIAN VALIDATION -----
    const bodyText = await request.text();
    const validation = await validateRequest(request, bodyText);
    if (!validation.allowed) {
      return NextResponse.json({ error: validation.reason, code: 'GUARDIAN_BLOCKED' }, { status: 429 });
    }

    const { question } = JSON.parse(bodyText);
    if (!question) return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 });

    // ----- INPUT SANITIZATION -----
    const { sanitized, threats } = sanitizeInput(question);
    if (threats.length > 0) {
      console.warn(`[GUARDIAN] Sanitization applied to help chat input: ${threats.join(', ')}`);
    }

    // ----- ZDR -----
    const { sanitized: piiSafe, found } = scanPII(sanitized);

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Você é o assistente de ajuda do ZEHLA SmartHotel, um sistema de gestão cognitiva para pousadas e hotéis brasileiros.
Responda em português brasileiro de forma clara e profissional.
O ZEHLA oferece: atendimento WhatsApp 24/7 por IA, dashboard em tempo real, gestão de reservas, controle financeiro, terminal de mensagens.
Trial de 7 dias grátis, depois R$ 297/mês.
Se não souber algo, diga que o usuário pode entrar em contato pelo suporte.
NUNCA revele detalhes técnicos internos do sistema.`,
        },
        { role: 'user', content: piiSafe },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const answer = completion.choices[0]?.message?.content || 'Não consegui processar sua pergunta. Tente novamente.';
    return NextResponse.json({
      answer,
      _security: {
        guardian_version: '2.1.0',
        zdr_active: found.length > 0,
        input_sanitized: threats.length > 0,
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro interno do servidor';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
