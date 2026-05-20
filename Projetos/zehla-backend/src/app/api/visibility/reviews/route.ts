import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmRouter } from '@/lib/ai/llm-router';

export async function POST(req: Request) {
  try {
    const { reviewText, guestName, propertyId } = await req.json();

    if (!reviewText || !guestName || !propertyId) {
      return NextResponse.json({ error: 'Missing reviewText, guestName, or propertyId' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const systemPrompt = `Você é o Agente 09 (Visibility Agent) do ZEHLA SmartHotel.
Seu objetivo é gerar respostas estratégicas para avaliações do Google Business Profile.
Siga a "Fórmula de Ouro" do Guia Google para Pousadas:
1. Personalize: Use o nome do hóspede (${guestName}).
2. Reforce o elogio: Cite o que ele gostou.
3. Destaque um diferencial: Mencione algo que ele não citou (ex: "nosso café da manhã artesanal", "piscina aquecida").
4. Convide de volta: "Esperamos te receber novamente!".

REGRA CRÍTICA DE SEGURANÇA:
- NUNCA ofereça descontos, brindes ou cortesias em troca de avaliações (isso viola as políticas do Google).
- Use palavras-chave naturalmente: "pousada em ${property.city}", "hospedagem".
- Retorne APENAS o texto da resposta.`;

    const llmResponse = await llmRouter.generate({
      model: 'classification',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Avaliação do hóspede: "${reviewText}"` }
      ],
      temperature: 0.7
    });

    // Salva como rascunho no AgentLog para aprovação humana
    const draftLog = await prisma.agentLog.create({
      data: {
        agentName: 'VisibilityAgent',
        action: 'generate_review_response',
        intent: 'generate_review_response',
        input: reviewText,
        output: llmResponse.content,
        status: 'PENDING_APPROVAL',
        propertyId: propertyId,
        tokensUsed: llmResponse.tokensUsed,
        duration: llmResponse.duration
      }
    });

    return NextResponse.json({
      success: true,
      draftId: draftLog.id,
      response: llmResponse.content
    });

  } catch (error: any) {
    console.error('Error in reviews endpoint:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
