// src/lib/intelligence/funnel/next-action.ts
// Determines the next best action for a lead based on cluster and pain

import { NextAction, FunnelCluster, PainCluster } from './types';

const EMAIL_TEMPLATES: Record<string, Record<string, string>> = {
  financeira: {
    HOT: 'email_financeira_hot',
    WARM: 'email_financeira_warm',
    COLD: 'email_financeira_cold',
  },
  operacional: {
    HOT: 'email_operacional_hot',
    WARM: 'email_operacional_warm',
    COLD: 'email_operacional_cold',
  },
  ocupacao: {
    HOT: 'email_ocupacao_hot',
    WARM: 'email_ocupacao_warm',
    COLD: 'email_ocupacao_cold',
  },
};

const WHATSAPP_TEMPLATES: Record<string, Record<string, string>> = {
  financeira: {
    HOT: 'wa_financeira_hot',
    WARM: 'wa_financeira_warm',
    COLD: 'wa_financeira_cold',
  },
  operacional: {
    HOT: 'wa_operacional_hot',
    WARM: 'wa_operacional_warm',
    COLD: 'wa_operacional_cold',
  },
  ocupacao: {
    HOT: 'wa_ocupacao_hot',
    WARM: 'wa_ocupacao_warm',
    COLD: 'wa_ocupacao_cold',
  },
};

export async function determineNextAction(
  leadId: string,
  cluster: FunnelCluster,
  painCluster: PainCluster = 'desconhecida'
): Promise<NextAction> {
  const pain = painCluster === 'desconhecida' ? 'financeira' : painCluster;

  if (cluster === 'HOT') {
    return {
      action: 'send_whatsapp_direct',
      channel: 'whatsapp',
      priority: 'high',
      template: WHATSAPP_TEMPLATES[pain]?.HOT,
      delay: 0,
      reason: `Lead HOT com dor ${pain} — abordagem direta via WhatsApp`,
    };
  }

  if (cluster === 'WARM') {
    return {
      action: 'send_email_nurture',
      channel: 'email',
      priority: 'medium',
      template: EMAIL_TEMPLATES[pain]?.WARM,
      delay: 30,
      reason: `Lead WARM com dor ${pain} — nutrição por email`,
    };
  }

  return {
    action: 'add_to_retarget_audience',
    channel: 'ads',
    priority: 'low',
    delay: 60,
    reason: `Lead COLD — adicionar ao público de retargeting`,
  };
}

export function getLandingPageVariant(painCluster: PainCluster): string {
  switch (painCluster) {
    case 'financeira':
      return '/landing/financeira';
    case 'operacional':
      return '/landing/operacional';
    case 'ocupacao':
      return '/landing/ocupacao';
    default:
      return '/landing/financeira';
  }
}

export function getAdCreativeVariant(cluster: FunnelCluster, painCluster: PainCluster): string {
  if (cluster === 'HOT') {
    switch (painCluster) {
      case 'financeira':
        return 'google_search_reduza_comissoes';
      case 'operacional':
        return 'meta_instagram_whatsapp_automatico';
      case 'ocupacao':
        return 'meta_instagram_lote_quartos';
      default:
        return 'google_search_zeHLA';
    }
  }

  return 'meta_brand_awareness';
}
