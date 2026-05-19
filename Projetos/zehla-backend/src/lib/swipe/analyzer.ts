import { type LeadProfile, type SwipeMatch, type TierRecommendation } from './types';

// src/lib/swipe/analyzer.ts

/**
 * Gera uma justificativa técnica baseada em regras (Heurística).
 * CUSTO ZERO: Não utiliza APIs externas de LLM.
 */
export function gerarJustificativaHeuristica(
  profile: LeadProfile,
  recommendation: TierRecommendation,
  match: SwipeMatch
): string {
  const { tier, signals } = recommendation;
  
  // 1. Pegar os 2 sinais mais fortes
  const topSignals = signals
    .filter(s => s.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2);

  const signalDescriptions = topSignals.map(s => s.description.toLowerCase()).join(' e ');

  // 2. Montar a frase baseada no Tier
  let base = "";
  if (tier === 'max') {
    base = `O plano MAX é ideal pois o lead apresenta alto potencial de escala: ${signalDescriptions}.`;
  } else if (tier === 'pro') {
    base = `Recomendamos o PRO devido ao perfil operacional identificado: ${signalDescriptions}.`;
  } else {
    base = `Início sugerido no LITE para validação de interesse: ${signalDescriptions}.`;
  }

  // 3. Adicionar contexto do Swipe
  const swipeContext = match.swipe.category === 'saudacao' 
    ? " Usar template de abordagem direta." 
    : ` Focar em resolver a dor de ${profile.dor || 'gestão'}.`;

  return `${base}${swipeContext}`;
}

/**
 * Interface compatível com o worker para facilitar futuras migrações se necessário.
 */
export async function gerarJustificativaIA(
  profile: LeadProfile,
  match: SwipeMatch,
  recommendation: TierRecommendation
): Promise<string> {
  // Chamando a versão heurística (Custo Zero)
  return gerarJustificativaHeuristica(profile, recommendation, match);
}
