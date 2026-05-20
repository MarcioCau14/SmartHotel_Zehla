import ZAI from 'z-ai-web-dev-sdk';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) : void {
  try {
    const { prompt } = await request.json();
    if (!prompt) return NextResponse.json({ error: 'Prompt obrigatório' }, { status: 400 });

    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Você é um especialista em marketing para pousadas e hotéis brasileiros.
Gere estratégias práticas, acionáveis e realistas.
Considere: WhatsApp Marketing, Instagram, Google Meu Negócio, Booking.com, Airbnb.
Responda em português brasileiro com formato estruturado usando emojis e tópicos.`
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    return NextResponse.json({ strategy: completion.choices[0]?.message?.content });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
