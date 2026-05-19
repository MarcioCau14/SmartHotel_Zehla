// src/lib/swipe/swipe-generator.ts
import { prisma } from '@/lib/prisma';
import { type LeadProfile, type SwipeTemplate } from "./types";

/**
 * ZEHLA Swipe Generator (MAX Tier Exclusive)
 * Sintetiza novos templates baseados no contexto do lead e DNA da propriedade.
 */
export async function generateAutonomousSwipe(
  profile: LeadProfile,
  propertyId: string
): Promise<Partial<SwipeTemplate>> {
  
  // 1. Buscar DNA da Propriedade
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: { toneProfile: true }
  });

  if (!property) throw new Error("Property not found");

  // 2. Construir Contexto para o LLM (Kimi 2.6 / GPT-4o)
  const context = {
    lead: {
      name: profile.email.split('@')[0], // Placeholder para nome
      dor: profile.dor,
      tamanho: profile.qtdQuartos > 20 ? 'Grande' : 'Pequena/Média',
      score: profile.score
    },
    property: {
      name: property.name,
      tone: property.toneProfile?.toneStyle || 'Consultativo',
      formality: property.toneProfile?.toneFormality || 'Adaptativo'
    }
  };

  // 3. Simulação de Chamada LLM (A ser integrada com ZEHLA Brain API)
  console.log(`🤖 [GEN_MAX] Sintetizando swipe para dor: ${profile.dor}`);
  
  // Placeholder de Resposta Sintetizada
  const synthesizedContent = `Olá! Vi que você está enfrentando desafios com ${profile.dor} na ${property.name}. 
No ZEHLA, automatizamos isso para que você recupere sua paz e sua margem de lucro. 
Podemos conversar sobre como eliminar esse gargalo hoje?`;

  return {
    id: `gen-${Date.now()}`,
    title: `Sintetizado: Resposta para ${profile.dor}`,
    content: synthesizedContent,
    tier: 'max',
    category: 'conversion',
    channel: 'whatsapp',
    painType: profile.dor,
    convRate: 0,
    timesUsed: 0,
    provenByConversion: false,
    isActive: true
  };
}
