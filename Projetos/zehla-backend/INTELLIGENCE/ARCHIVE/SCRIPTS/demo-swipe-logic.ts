// scripts/demo-swipe-logic.ts
import { classificarTier } from '../src/lib/swipe/classifier';
import { matchSwipes } from '../src/lib/swipe/matcher';
import { gerarJustificativaHeuristica } from '../src/lib/swipe/analyzer';
import { type LeadProfile } from '../src/lib/swipe/types';

async function runDemo() {
  console.log("=== SIMULAÇÃO ZEHLA SWIPE INTELLIGENCE (CUSTO ZERO) ===\n");

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

  console.log(`📍 LEAD: ${simulatedLead.pousada}`);
  console.log(`   Porte: ${simulatedLead.qtdQuartos} suítes | Score: ${simulatedLead.score} | Dor: ${simulatedLead.dor}\n`);

  // 2. Rodar o Matcher (Simulado - buscando no banco se houver, ou apenas simulando lógica)
  // Como estamos em simulação, vamos apenas mostrar o que o matcher faria
  console.log("--- PROCESSANDO SWIPE MATCH ---");
  
  // Simulando retorno do matchSwipes (que agora é custo zero e local)
  const result = await matchSwipes(simulatedLead);

  console.log(`✅ TIER RECOMENDADO: ${result.tierRecommendation.tier.toUpperCase()} (${(result.tierRecommendation.confidence * 100).toFixed(0)}% confiança)`);
  console.log(`📄 RAZÕES:`);
  result.tierRecommendation.reasons.forEach(r => console.log(`   - ${r}`));

  console.log("\n--- JUSTIFICATIVA DO CÉREBRO ZEHLA (CUSTO ZERO) ---");
  if (result.matches.length > 0) {
    const justification = gerarJustificativaHeuristica(simulatedLead, result.tierRecommendation, result.matches[0]);
    console.log(`👉 "${justification}"`);
    
    console.log("\n--- TOP 3 RESPOSTAS SUGERIDAS ---");
    result.matches.forEach((m, i) => {
      console.log(`${i+1}. [${m.swipe.title}] - Match Score: ${m.matchScore}%`);
      console.log(`   "${m.swipe.content.substring(0, 80)}..."\n`);
    });
  } else {
    console.log("⚠️ Nenhum template específico encontrado. Usando fallback universal.");
  }

  console.log("=======================================================");
}

runDemo().catch(console.error);
