import { classificarTier } from '../src/lib/swipe/classifier';
import { gerarJustificativaHeuristica } from '../src/lib/swipe/analyzer';
import { matchSwipes } from '../src/lib/swipe/matcher';

import { type LeadProfile } from '../src/lib/swipe/types';

// scripts/demo-swipe-logic.ts

async function runDemo() {
  try {
   ===\n");

  // 1. Simular um Lead (Pousada de Médio Porte com dor operacional)
  const simulatedLead: LeadProfile = {
    id: "lead_demo_001",
    email: "contato@pousadaparaiso.com.br",
    pousada: "Pousada Paraíso",
    score: 65, // Lead quente
    cluster: "HOT",
    dor: "operacional",
    funnelStage: "QUALIFIED",
    qtdQuartos: 12, // Porte PRO
    regiao: "Nordeste",
    uf: "RN",
    totalEventos: 8,
    canaisUsados: ["whatsapp", "instagram"]
  };

  
  

  // 2. Rodar o Matcher (Simulado - buscando no banco se houver, ou apenas simulando lógica)
  // Como estamos em simulação, vamos apenas mostrar o que o matcher faria
  
  
  // Simulando retorno do matchSwipes (que agora é custo zero e local)
  const result = await matchSwipes(simulatedLead);

  } (${(result.tierRecommendation.confidence * 100).toFixed(0)}% confiança)`);
  
  result.tierRecommendation.reasons.forEach(r => );

   ---");
  if (result.matches.length > 0) {
    const justification = gerarJustificativaHeuristica(simulatedLead, result.tierRecommendation, result.matches[0]);
    
    
    
    result.matches.forEach((m, i) => {
      
      }..."\n`);
    });
  } else {
    
  }

  
}

runDemo().catch(console.error);
