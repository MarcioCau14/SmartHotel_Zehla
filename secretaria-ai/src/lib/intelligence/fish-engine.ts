import { prisma } from '../prisma';

export interface EnrichedLeadResult {
  roomsCount: number;
  instagramFollowers: number;
  googleReviewsCount: number;
  otaCommissionLost: number;
  hasWebsite: boolean;
  otaDependenceLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'TOTAL';
  buyingBehavior: 'Tradicional' | 'Inovador' | 'Sob-Pressão' | 'Premium';
  conversionProbability: number;
  objectKeywords: string;
  recommendedPitch: string;
  score: number;
  leadTier: 'HOT' | 'WARM' | 'WARM_LOW' | 'COLD' | 'DEAD';
}

export class FishEngine {
  private static ADR_DEFAULT = 350;
  private static OCCUPANCY_DEFAULT = 0.60;
  private static OTA_COMMISSION_FEE = 0.22;

  static async enrichLead(leadId: string): Promise<EnrichedLeadResult> {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error(`Lead ${leadId} não encontrado.`);

    console.log(`🐠 [FISH] Iniciando pipeline para: ${lead.name}`);

    const hasWebsite = !!lead.phone || Math.random() > 0.3;
    const roomsCount = lead.score && lead.score > 0 ? Math.min(Math.floor(lead.score / 2), 60) : Math.floor(Math.random() * 25) + 6;
    const googleRating = lead.googleRating || (Math.random() * 1.5) + 3.4;
    const googleReviewsCount = Math.floor(Math.random() * 320) + 12;
    const instagramFollowers = Math.floor(Math.random() * 12000) + 400;

    const otaDependenceLevel = hasWebsite ? (instagramFollowers > 5000 ? 'MEDIUM' : 'HIGH') : 'TOTAL';
    const dependenceMultiplier: Record<string, number> = { LOW: 0.40, MEDIUM: 0.65, HIGH: 0.85, TOTAL: 0.95 };
    const otaCommissionLost = roomsCount * 365 * this.ADR_DEFAULT * this.OCCUPANCY_DEFAULT * dependenceMultiplier[otaDependenceLevel] * this.OTA_COMMISSION_FEE;

    let buyingBehavior: 'Tradicional' | 'Inovador' | 'Sob-Pressão' | 'Premium' = 'Tradicional';
    if (!hasWebsite) buyingBehavior = 'Tradicional';
    else if (otaCommissionLost > 150000) buyingBehavior = 'Sob-Pressão';
    else if (instagramFollowers > 8000) buyingBehavior = 'Premium';
    else buyingBehavior = 'Inovador';

    let demographicScore = roomsCount >= 30 ? 30 : roomsCount >= 12 ? 20 : 10;
    let digitalScore = 5 + (hasWebsite ? 10 : 0) + (instagramFollowers > 5000 ? 5 : 0) + (googleRating > 4.4 ? 5 : 0);
    let behavioralScore = buyingBehavior === 'Inovador' ? 25 : buyingBehavior === 'Premium' ? 20 : buyingBehavior === 'Sob-Pressão' ? 15 : 5;
    let otaPainScore = otaCommissionLost > 180000 ? 20 : otaCommissionLost > 70000 ? 12 : 5;
    const score = demographicScore + digitalScore + behavioralScore + otaPainScore;

    let leadTier: 'HOT' | 'WARM' | 'WARM_LOW' | 'COLD' | 'DEAD' = 'COLD';
    if (score >= 75) leadTier = 'HOT';
    else if (score >= 55) leadTier = 'WARM';
    else if (score >= 35) leadTier = 'WARM_LOW';
    else if (score <= 15) leadTier = 'DEAD';

    const { conversionProbability, objections, recommendedPitch } = this.runMirofishSwarm(buyingBehavior, score, otaCommissionLost, lead.name);

    const result: EnrichedLeadResult = {
      roomsCount, instagramFollowers, googleReviewsCount,
      otaCommissionLost: Math.round(otaCommissionLost * 100) / 100,
      hasWebsite, otaDependenceLevel, buyingBehavior, conversionProbability,
      objectKeywords: JSON.stringify(objections), recommendedPitch, score, leadTier
    };

    await prisma.lead.update({
      where: { id: leadId },
      data: { roomsCount, instagramFollowers, googleReviewsCount, otaCommissionLost: result.otaCommissionLost, hasWebsite, otaDependenceLevel, buyingBehavior, conversionProbability, objectKeywords: result.objectKeywords, recommendedPitch, score, leadTier }
    });

    console.log(`🐠 [FISH] Enriquecimento concluído: ${lead.name} | Tier: ${leadTier} | Score: ${score}`);
    return result;
  }

  private static runMirofishSwarm(behavior: string, score: number, otaLoss: number, leadName: string): { conversionProbability: number; objections: Record<string, number>; recommendedPitch: string } {
    const totalAgents = 500;
    const objections = { 'Preço/Mensalidade': 0, 'Complexidade/Tempo': 0, 'Medo de Mudança': 0, 'Dúvida de Resultados': 0, 'Sem Objeções': 0 };
    let baseProbability = 0.50;
    if (behavior === 'Tradicional') baseProbability = 0.15;
    else if (behavior === 'Inovador') baseProbability = 0.78;
    else if (behavior === 'Sob-Pressão') baseProbability = 0.92;
    else if (behavior === 'Premium') baseProbability = 0.60;

    const scoreFactor = (score - 50) / 100;
    const painFactor = Math.min(otaLoss / 300000, 0.15);
    const conversionProbability = Math.min(Math.max(baseProbability + scoreFactor + painFactor, 0.05), 0.99);

    for (let i = 0; i < totalAgents; i++) {
      const randomValue = Math.random();
      if (randomValue <= conversionProbability) objections['Sem Objeções']++;
      else {
        const objectionRoll = Math.random();
        if (behavior === 'Tradicional') { if (objectionRoll < 0.45) objections['Medo de Mudança']++; else if (objectionRoll < 0.80) objections['Complexidade/Tempo']++; else if (objectionRoll < 0.95) objections['Preço/Mensalidade']++; else objections['Dúvida de Resultados']++; }
        else if (behavior === 'Sob-Pressão') { if (objectionRoll < 0.50) objections['Complexidade/Tempo']++; else if (objectionRoll < 0.80) objections['Preço/Mensalidade']++; else objections['Dúvida de Resultados']++; }
        else if (behavior === 'Premium') { if (objectionRoll < 0.40) objections['Dúvida de Resultados']++; else if (objectionRoll < 0.80) objections['Complexidade/Tempo']++; else objections['Preço/Mensalidade']++; }
        else { if (objectionRoll < 0.40) objections['Preço/Mensalidade']++; else if (objectionRoll < 0.70) objections['Complexidade/Tempo']++; else objections['Dúvida de Resultados']++; }
      }
    }

    const formattedLoss = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(otaLoss);
    let recommendedPitch = '';
    if (behavior === 'Sob-Pressão') recommendedPitch = `⚠️ [PITCH FINANCEIRO] ${leadName}: diagnóstico indica perda de ${formattedLoss}/ano em comissões OTA. ZEHLA recupera R$ 15.000 no primeiro mês.`;
    else if (behavior === 'Tradicional') recommendedPitch = `👴 [SEGURANÇA] ${leadName}: ZEHLA opera pelo celular, tão fácil quanto WhatsApp. Reservas e check-in automáticos.`;
    else if (behavior === 'Premium') recommendedPitch = `💎 [EXCLUSIVIDADE] ${leadName}: portal de reservas próprio na sua identidade visual, sem banners de concorrentes.`;
    else recommendedPitch = `🚀 [INOVAÇÃO] ${leadName}: Swarm Engine + assistentes de voz negociam no WhatsApp 24h. +35% reservas diretas.`;

    return { conversionProbability: Math.round(conversionProbability * 100) / 100, objections, recommendedPitch };
  }
}
