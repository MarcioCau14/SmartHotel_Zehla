import { llmRouter } from '@/lib/ai/llm-router';

export class FinanceAgentsService {
  /**
   * Gera o insight financeiro unificado (Jony, Maria & Tedd) em português.
   */
  static async generateDailyInsight(
    propertyId: string,
    summaryData: {
      totalRevenue: number;
      totalCosts: number;
      profit: number;
      profitMargin: number;
      avgOccupancy: number;
      avgADR: number;
      avgRevPAR: number;
    },
    alerts: string[]
  ): Promise<string> {
    const systemPrompt = `Você é a inteligência financeira do ZEHLA, composta por uma trindade de agentes especializados:
- JONY (O Sentinela Diário): Monitora faturamento, check-ins e anomalias da operação diária.
- MARIA (A Investigadora Orquestradora): Analisa tendências quinzenais, detecta custos fora do padrão e audita canais.
- TEDD (O Estrategista Preditivo): Projeta ocupação/receita para 30/90 dias e sugere rebalanceamento de preços.

Analise os dados financeiros e alertas da pousada e produza uma síntese conversacional curta (máximo de 3 frases) em português do Brasil, estilo direto e acionável. Não use placeholders.`;

    const userContent = `Dados Consolidados (Últimos dias):
- Receita Bruta/Líquida: R$ ${summaryData.totalRevenue.toFixed(2)}
- Custos Operacionais Totais: R$ ${summaryData.totalCosts.toFixed(2)}
- Margem de Lucro: ${summaryData.profitMargin.toFixed(1)}%
- Ocupação Média: ${summaryData.avgOccupancy.toFixed(1)}%
- Diária Média (ADR): R$ ${summaryData.avgADR.toFixed(2)}
- RevPAR: R$ ${summaryData.avgRevPAR.toFixed(2)}
- Alertas Ativos: ${alerts.length > 0 ? alerts.join('; ') : 'Nenhum alerta crítico encontrado'}`;

    try {
      const response = await llmRouter.generate({
        model: 'general',
        agentType: 'ze-analyst',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.6
      });
      return response.content.trim();
    } catch (error) {
      console.error('Error generating finance agents insight:', error);
      return 'Receita e ocupação estáveis. Continue acompanhando os lançamentos diários e alertas de custos.';
    }
  }

  /**
   * Responde dúvidas sobre o caixa e desempenho em linguagem natural.
   */
  static async askQuestion(
    propertyId: string,
    question: string,
    summaryData: {
      totalRevenue: number;
      totalCosts: number;
      profit: number;
      profitMargin: number;
      avgOccupancy: number;
      avgADR: number;
      avgRevPAR: number;
    }
  ): Promise<string> {
    const systemPrompt = `Você é o ZEHLA Finance, um assistente de IA conversacional para finanças de pousadas brasileiras (estilo Pierre Finance).
Responda à pergunta do proprietário com base estritamente nos dados recentes fornecidos.
Fale de forma amigável, direta, como um diretor financeiro de confiança. Evite falar em jargões complexos e responda em até 3 frases.`;

    const userContent = `Dados Recentes da Pousada:
- Receita Líquida: R$ ${summaryData.totalRevenue.toFixed(2)}
- Custos Totais: R$ ${summaryData.totalCosts.toFixed(2)}
- Margem: ${summaryData.profitMargin.toFixed(1)}%
- Ocupação: ${summaryData.avgOccupancy.toFixed(1)}%
- ADR: R$ ${summaryData.avgADR.toFixed(2)}
- RevPAR: R$ ${summaryData.avgRevPAR.toFixed(2)}

Pergunta do proprietário: "${question}"`;

    try {
      const response = await llmRouter.generate({
        model: 'general',
        agentType: 'ze-analyst',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent }
        ],
        temperature: 0.7
      });
      return response.content.trim();
    } catch (error) {
      console.error('Error asking finance agents question:', error);
      return 'Desculpe, não consegui analisar os dados no momento. Por favor, tente novamente mais tarde.';
    }
  }
}
