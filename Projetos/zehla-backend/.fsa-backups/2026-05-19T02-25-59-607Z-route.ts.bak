import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { llmRouter } from '@/lib/ai/llm-router';

export async function POST(req: Request) {
  try {
    const { caption, propertyId } = await req.json();

    if (!caption || !propertyId) {
      return NextResponse.json({ error: 'Missing caption or propertyId' }, { status: 400 });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    const systemPrompt = `Você é o Agente 09 (Visibility Agent) do ZEHLA SmartHotel.
Seu objetivo é reescrever legendas do Instagram focando em SEO Local para o Google Business Profile (GBP).
Siga estas regras estritamente:
1. Use palavras-chave estratégicas naturalmente (ex: "pousada na Praia do Rosa", "café da manhã artesanal", "piscina aquecida").
2. Evite conteúdo repetido (não copie a legenda original linha por linha).
3. Mantenha o tom acolhedor e profissional.
4. Use as informações da pousada: Nome: ${property.name}, Cidade: ${property.city}/${property.state}.
5. Retorne APENAS a nova legenda reescrita.`;

    const llmResponse = await llmRouter.generate({
      model: 'classification', // Mapeia para mistral:7b ou fallback
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Reescreva esta legenda: "${caption}"` }
      ],
      temperature: 0.7
    });

    // Salva como rascunho no AgentLog para aprovação humana
    const draftLog = await prisma.agentLog.create({
      data: {
        agentName: 'VisibilityAgent',
        action: 'sync_instagram_post',
        intent: 'sync_instagram_post',
        input: caption,
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
      original: caption,
      rewritten: llmResponse.content
    });

  } catch (error: any) {
    console.error('Error in post-syncer:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
