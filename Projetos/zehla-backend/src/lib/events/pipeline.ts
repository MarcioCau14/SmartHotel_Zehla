// src/lib/events/pipeline.ts
import { matchSwipes } from '../swipe/matcher';

export async function runPipeline(leadId: string) {
  console.log(`[Pipeline] Iniciando processamento do lead ${leadId}`);
  
  // Estágio 4.5: Swipe Match
  // Integrando o matcher para fundamentar a decisão com dados e IA
  const result = await matchSwipes({ id: leadId } as any);
  
  console.log(`[Pipeline] Swipe Match concluído: Tier Sugerido ${result.tierRecommendation.tier}`);
  
  return result;
}
