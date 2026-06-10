import { Result } from '../../shared/Result';
import { ReadinessAssessment } from './ReadinessEvaluator';
import { RoiPrediction } from './RoiPredictor';
import { AgentRecommendation } from './AgentRecommender';

export interface PlaybookOutput {
  title: string;
  markdown: string;
  generatedAt: Date;
}

export class PlaybookGenerator {
  static generate(
    assessment: ReadinessAssessment,
    roi: RoiPrediction,
    recommendations: AgentRecommendation[]
  ): Result<PlaybookOutput, Error> {
    try {
      const pName = assessment.propertyName || 'Sua Pousada';

      const markdown = `
# Playbook de Transformação AI-Native: ${pName}

Este documento foi gerado de forma personalizada e dinâmica pelo **ZEHLA SmartHotel Brain** em ${assessment.evaluatedAt.toLocaleDateString('pt-BR')}.

---

## 1. Diagnóstico de Maturidade Digital

- **Maturidade Score:** ${assessment.score}/100
- **Categoria de Maturidade:** **${assessment.category}**
- **Nível de Risco LGPD:** **${assessment.lgpdRisk}**

### Análise Executiva:
Sua propriedade foi categorizada na fase **${assessment.category}**. 
${
  assessment.category === 'Co-Pilots'
    ? 'A pousada está em fase inicial de informatização. O foco deve ser a integração de assistentes e chatbots automáticos que tirem a carga repetitiva das recepções manuais no primeiro dia.'
    : assessment.category === 'Brains'
    ? 'A pousada já possui processos automatizados. A prioridade agora é a inteligência preditiva (como pricing dinâmico e follow-up ativo baseado em comportamento).'
    : 'Sua propriedade está próxima da autonomia operacional. O foco é a implantação de agentes com GraphRAG e check-in físico zero.'
}

---

## 2. Projeção Financeira de ROI (Retorno de Investimento)

Com base nas métricas inseridas, estimamos os seguintes ganhos ao automatizar as operações com a stack ZEHLA:

| Métrica | Ganho Mensal Estimado | Impacto Anual |
|---------|-----------------------|---------------|
| **Boost de Ocupação (+${roi.occupancyBoostPercent}%)** | R$ ${roi.occupancyRevenueGain.toLocaleString('pt-BR')} | R$ ${(roi.occupancyRevenueGain * 12).toLocaleString('pt-BR')} |
| **Recuperação de Comissões de OTAs** | R$ ${roi.otaCommissionSavings.toLocaleString('pt-BR')} | R$ ${(roi.otaCommissionSavings * 12).toLocaleString('pt-BR')} |
| **Economia de Staffing (${roi.staffTimeSavedHours}h salvas)** | R$ ${roi.staffCostSavings.toLocaleString('pt-BR')} | R$ ${(roi.staffCostSavings * 12).toLocaleString('pt-BR')} |
| **GANHO TOTAL ESTIMADO** | **R$ ${roi.totalMonthlyGain.toLocaleString('pt-BR')}** | **R$ ${roi.totalYearlyGain.toLocaleString('pt-BR')}** |

---

## 3. Recomendações e Roadmap de Agentes de IA

Com base no seu perfil, mapeamos a seguinte prioridade de rollout:

${recommendations
  .map(
    (r, idx) => `
### ${idx + 1}. ${r.agentName} (Prioridade: **${r.priority}**)
- **Descrição:** ${r.description}
- **Multiplicador de ROI Estimado:** ${r.estimatedRoiMultiplier}x
`
  )
  .join('')}

---

## 4. Plano de Ação para Conformidade LGPD

Para mitigar o risco de compliance avaliado como **${assessment.lgpdRisk}**, siga este checklist imediato:
1. [ ] Implementar política de opt-in explícita para contatos comerciais no WhatsApp.
2. [ ] Configurar canal de deleção de dados pessoais sob demanda dos hóspedes.
3. [ ] Substituir planilhas físicas e de texto aberto por armazenamento criptografado no banco de dados.

*O uso do ZEHLA Data Registry (ZDR) garante que todos os dados trafegados pelos agentes passem pelo PIIScanner para anonimização preventiva.*
`;

      const playbook: PlaybookOutput = Object.freeze({
        title: `Playbook de Transformação AI-Native - ${pName}`,
        markdown: markdown.trim(),
        generatedAt: new Date()
      });

      return Result.ok(playbook);
    } catch (err: any) {
      return Result.fail(err instanceof Error ? err : new Error(err.message || 'Unknown playbook generation error'));
    }
  }
}
