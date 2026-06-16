// src/lib/events/actions.ts
import { prisma } from '@/lib/prisma';
import { matchSwipes } from '../swipe/matcher';
import { type LeadProfile } from '../swipe/types';

export const CLUSTER_ACTIONS: Record<string, string[]> = {
  'COLD->WARM': ['send_nurture_email_1', 'add_to_newsletter'],
  'WARM->HOT': ['send_sales_alert_urgent', 'sugerir_swipe_zcc', 'activate_whatsapp_sequence'],
  'COLD->HOT': ['send_sales_alert_urgent', 'sugerir_swipe_zcc', 'send_trial_invitation'],
};

export async function executeAction(actionType: string, payload: any) {
  switch (actionType) {
    case 'sugerir_swipe_zcc': {
      console.log(`[Action] Sugerindo swipe para lead ${payload.leadId}`);
      const leadId = payload.leadId;
      
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
        include: { events: { orderBy: { timestamp: 'desc' }, take: 10 } }
      });

      if (!lead) {
        return { 
          status: 'skipped', 
          action: actionType, 
          error: 'Lead not found' 
        };
      }

      const profile: LeadProfile = {
        id: lead.id,
        email: lead.email || '',
        pousada: lead.property || '',
        score: lead.conversionScore || 0,
        tier: lead.leadTier || 'COLD',
        cluster: (lead.cluster as any) || 'COLD',
        dor: (lead.painPoints as any) || 'desconhecida',
        funnelStage: (lead.funnelStage as any) || 'NEUTRAL',
        qtdQuartos: lead.roomsCount,
        regiao: lead.region,
        uf: lead.state,
        totalEventos: lead.events.length,
        canaisUsados: [...new Set(lead.events.map(e => e.eventSource))]
      };

      const result = await matchSwipes(profile);

      // Atualiza o lead com o resultado da recomendação de tier
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          tierSugerido: result.tierRecommendation.tier,
          tierConfidence: result.tierRecommendation.confidence,
          tierSugeridoEm: new Date()
        }
      });

      return { 
        status: 'success', 
        action: actionType,
        result: {
          matchesCount: result.matches.length,
          suggestedTier: result.tierRecommendation.tier,
          confidence: result.tierRecommendation.confidence,
          matches: result.matches.map(m => ({
            title: m.swipe.title,
            rankScore: m.rankScore
          }))
        }
      };
    }
    default:
      return { status: 'ignored', action: actionType };
  }
}
