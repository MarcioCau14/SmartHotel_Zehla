// src/lib/intelligence/competitive/gap-mapper.ts
// Maps competitor gaps to ZEHLA features and attack strategies

export interface CompetitorGap {
  id: string;
  competitor: string;
  description: string;
  impact: 'ALTO' | 'MEDIO' | 'BAIXO';
  zehlAttack: string;
  zehlaModule: string;
  priority: number; // 1-10
}

export const COMPETITOR_GAPS: CompetitorGap[] = [
  // Silbeck (12 gaps)
  { id: 'SB-01', competitor: 'Silbeck', description: 'Complexidade excessiva — 38+ módulos confusos', impact: 'ALTO', zehlAttack: 'Interface "3 cliques" — Clean Architecture Lite', zehlaModule: 'pms', priority: 9 },
  { id: 'SB-02', competitor: 'Silbeck', description: 'Onboarding leva horas/dias', impact: 'ALTO', zehlAttack: 'Wizard de 5 minutos', zehlaModule: 'onboarding', priority: 9 },
  { id: 'SB-03', competitor: 'Silbeck', description: 'Sem IA preditiva — tudo reativo', impact: 'MEDIO', zehlAttack: 'ZEHLA Brain com LLM local', zehlaModule: 'brain', priority: 8 },
  { id: 'SB-04', competitor: 'Silbeck', description: 'Channel Manager lento e bugado', impact: 'ALTO', zehlAttack: 'Channel Manager assíncrono com BullMQ', zehlaModule: 'connect', priority: 8 },
  { id: 'SB-05', competitor: 'Silbeck', description: 'CRM genérico sem segmentação', impact: 'MEDIO', zehlAttack: 'CRM Cognitivo com cognitiveTags', zehlaModule: 'brain', priority: 7 },
  { id: 'SB-06', competitor: 'Silbeck', description: 'Sem automação WhatsApp nativa', impact: 'ALTO', zehlAttack: 'Hermes (WhatsApp IA 24h)', zehlaModule: 'hermes', priority: 10 },
  { id: 'SB-07', competitor: 'Silbeck', description: 'Pricing rígido sem revenue dinâmico', impact: 'ALTO', zehlAttack: 'Revenue AI com precificação em tempo real', zehlaModule: 'revenue', priority: 9 },
  { id: 'SB-08', competitor: 'Silbeck', description: 'Sem link-in-bio integrado', impact: 'BAIXO', zehlAttack: 'ZEHLA Connect com booking direto', zehlaModule: 'connect', priority: 4 },
  { id: 'SB-09', competitor: 'Silbeck', description: 'Suporte técnico lento', impact: 'MEDIO', zehlAttack: 'Auto-resolução via IA', zehlaModule: 'hermes', priority: 6 },
  { id: 'SB-10', competitor: 'Silbeck', description: 'Sem análise de intenção do hóspede', impact: 'ALTO', zehlAttack: 'PredictGuestPreferencesUseCase', zehlaModule: 'brain', priority: 9 },
  { id: 'SB-11', competitor: 'Silbeck', description: 'Relatórios estáticos', impact: 'MEDIO', zehlAttack: 'Dashboards em tempo real', zehlaModule: 'pms', priority: 5 },
  { id: 'SB-12', competitor: 'Silbeck', description: 'Lock-in por migração difícil', impact: 'MEDIO', zehlAttack: 'Onboarding mágico reduz fricção', zehlaModule: 'onboarding', priority: 6 },

  // Innotel (5 gaps)
  { id: 'IN-01', competitor: 'Innotel', description: 'CRM estático — sem previsão', impact: 'ALTO', zehlAttack: 'CRM Cognitivo prevê preferências do hóspede', zehlaModule: 'brain', priority: 9 },
  { id: 'IN-02', competitor: 'Innotel', description: 'Sem integração WhatsApp', impact: 'ALTO', zehlAttack: 'Hermes nativo', zehlaModule: 'hermes', priority: 10 },
  { id: 'IN-03', competitor: 'Innotel', description: 'Interface datada', impact: 'MEDIO', zehlAttack: 'Next.js SSR moderno', zehlaModule: 'connect', priority: 5 },
  { id: 'IN-04', competitor: 'Innotel', description: 'Sem automação de upsell', impact: 'ALTO', zehlAttack: 'AI-driven upsell via WhatsApp', zehlaModule: 'brain', priority: 8 },
  { id: 'IN-05', competitor: 'Innotel', description: 'Dados não cruzados com OTA', impact: 'MEDIO', zehlAttack: 'Integração direta com fontes', zehlaModule: 'connect', priority: 6 },

  // HMAX (4 gaps)
  { id: 'HM-01', competitor: 'HMAX', description: 'Foca apenas no passado financeiro', impact: 'ALTO', zehlAttack: 'ZEHLA atua na linha de frente (WhatsApp)', zehlaModule: 'hermes', priority: 9 },
  { id: 'HM-02', competitor: 'HMAX', description: 'Sem ação proativa', impact: 'ALTO', zehlAttack: 'Automação 24h com IA', zehlaModule: 'hermes', priority: 9 },
  { id: 'HM-03', competitor: 'HMAX', description: 'Sem CRM integrado', impact: 'MEDIO', zehlAttack: 'Ecossistema all-in-one', zehlaModule: 'brain', priority: 6 },
  { id: 'HM-04', competitor: 'HMAX', description: 'Sem mobile-first', impact: 'MEDIO', zehlAttack: 'PWA + WhatsApp-first', zehlaModule: 'connect', priority: 5 },

  // QuartoVerde (4 gaps)
  { id: 'QV-01', competitor: 'QuartoVerde', description: 'Freemium muito restritivo', impact: 'ALTO', zehlAttack: 'Freemium generoso com valor real', zehlaModule: 'funnel', priority: 8 },
  { id: 'QV-02', competitor: 'QuartoVerde', description: 'Sem IA no plano grátis', impact: 'ALTO', zehlAttack: 'Brain básico incluso no free', zehlaModule: 'brain', priority: 8 },
  { id: 'QV-03', competitor: 'QuartoVerde', description: 'Sem WhatsApp no free', impact: 'ALTO', zehlAttack: '100 mensagens/mês grátis', zehlaModule: 'hermes', priority: 9 },
  { id: 'QV-04', competitor: 'QuartoVerde', description: 'Upgrade caro', impact: 'MEDIO', zehlAttack: 'Pricing escalonado justo', zehlaModule: 'funnel', priority: 5 },

  // SimplesHotel (7 gaps)
  { id: 'SH-01', competitor: 'SimplesHotel', description: 'Interface complexa', impact: 'ALTO', zehlAttack: '3 cliques para resolver', zehlaModule: 'pms', priority: 8 },
  { id: 'SH-02', competitor: 'SimplesHotel', description: 'Sem IA', impact: 'ALTO', zehlAttack: 'Brain integrado', zehlaModule: 'brain', priority: 9 },
  { id: 'SH-03', competitor: 'SimplesHotel', description: 'Sem WhatsApp nativo', impact: 'ALTO', zehlAttack: 'Hermes', zehlaModule: 'hermes', priority: 10 },
  { id: 'SH-04', competitor: 'SimplesHotel', description: 'Sem revenue management', impact: 'ALTO', zehlAttack: 'Revenue AI', zehlaModule: 'revenue', priority: 8 },
  { id: 'SH-05', competitor: 'SimplesHotel', description: 'Sem link-in-bio', impact: 'BAIXO', zehlAttack: 'ZEHLA Connect', zehlaModule: 'connect', priority: 4 },
  { id: 'SH-06', competitor: 'SimplesHotel', description: 'Sem automação', impact: 'ALTO', zehlAttack: 'BullMQ + IA', zehlaModule: 'hermes', priority: 8 },
  { id: 'SH-07', competitor: 'SimplesHotel', description: 'Sem análise preditiva', impact: 'MEDIO', zehlAttack: 'PredictGuestPreferences', zehlaModule: 'brain', priority: 7 },

  // Cloudbeds (7 gaps)
  { id: 'CB-01', competitor: 'Cloudbeds', description: 'Preço em USD — caro para BR', impact: 'ALTO', zehlAttack: 'Pricing em BRL acessível', zehlaModule: 'funnel', priority: 8 },
  { id: 'CB-02', competitor: 'Cloudbeds', description: 'Suporte em inglês', impact: 'ALTO', zehlAttack: 'Suporte PT-BR nativo', zehlaModule: 'hermes', priority: 7 },
  { id: 'CB-03', competitor: 'Cloudbeds', description: 'Não entende mercado BR', impact: 'ALTO', zehlAttack: 'Feito para pousadas brasileiras', zehlaModule: 'brain', priority: 8 },
  { id: 'CB-04', competitor: 'Cloudbeds', description: 'Sem WhatsApp nativo', impact: 'ALTO', zehlAttack: 'Hermes', zehlaModule: 'hermes', priority: 10 },
  { id: 'CB-05', competitor: 'Cloudbeds', description: 'Complexo para pousadas pequenas', impact: 'ALTO', zehlAttack: 'Simplicidade como diferencial', zehlaModule: 'pms', priority: 8 },
  { id: 'CB-06', competitor: 'Cloudbeds', description: 'Webhook delays com APIs terceiras', impact: 'MEDIO', zehlAttack: 'Acesso direto ao PostgreSQL', zehlaModule: 'brain', priority: 6 },
  { id: 'CB-07', competitor: 'Cloudbeds', description: 'Sem IA preditiva', impact: 'ALTO', zehlAttack: 'Brain com LLM local', zehlaModule: 'brain', priority: 9 },

  // Stays.net (4 gaps)
  { id: 'ST-01', competitor: 'Stays.net', description: 'Foco apenas em booking engine', impact: 'MEDIO', zehlAttack: 'Ecossistema completo', zehlaModule: 'connect', priority: 5 },
  { id: 'ST-02', competitor: 'Stays.net', description: 'Sem PMS integrado', impact: 'ALTO', zehlAttack: 'All-in-one', zehlaModule: 'pms', priority: 8 },
  { id: 'ST-03', competitor: 'Stays.net', description: 'Sem IA', impact: 'ALTO', zehlAttack: 'Brain', zehlaModule: 'brain', priority: 8 },
  { id: 'ST-04', competitor: 'Stays.net', description: 'Sem WhatsApp', impact: 'ALTO', zehlAttack: 'Hermes', zehlaModule: 'hermes', priority: 9 },
];

export function getGapsByCompetitor(competitor: string): CompetitorGap[] {
  return COMPETITOR_GAPS.filter(g => g.competitor === competitor);
}

export function getGapsByModule(module: string): CompetitorGap[] {
  return COMPETITOR_GAPS.filter(g => g.zehlaModule === module);
}

export function getHighPriorityGaps(minPriority = 8): CompetitorGap[] {
  return COMPETITOR_GAPS.filter(g => g.priority >= minPriority);
}

export function getGapsByImpact(impact: 'ALTO' | 'MEDIO' | 'BAIXO'): CompetitorGap[] {
  return COMPETITOR_GAPS.filter(g => g.impact === impact);
}

export function getGapSummary(): { total: number; byImpact: Record<string, number>; byModule: Record<string, number> } {
  const byImpact: Record<string, number> = {};
  const byModule: Record<string, number> = {};

  for (const gap of COMPETITOR_GAPS) {
    byImpact[gap.impact] = (byImpact[gap.impact] || 0) + 1;
    byModule[gap.zehlaModule] = (byModule[gap.zehlaModule] || 0) + 1;
  }

  return {
    total: COMPETITOR_GAPS.length,
    byImpact,
    byModule,
  };
}
