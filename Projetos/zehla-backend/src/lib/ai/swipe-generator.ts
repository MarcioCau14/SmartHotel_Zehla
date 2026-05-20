/**
 * ZEHLA Swipe Generator (Plano MAX)
 * Gera mensagens de prospecção ultra-personalizadas usando Kimi 2.6 / LLMs Gratuitos
 */

import { freeLLMRouter } from './free-llm-router';
import { prisma } from '@/lib/prisma';

export class SwipeGenerator {
  /**
   * Gera um "Swipe" (mensagem) personalizado baseado no lead, propriedade e tendências
   */
  static async generateCustomSwipe(
    leadId: string, 
    propertyId: string, 
    trendSignalIds: string[] = []
  ) {
    console.log(`🧠 [SWIPE-GEN] Gerando síntese para lead ${leadId} (Tier MAX)...`);
    
    try {
      // 1. Buscar dados do Lead
      const lead = await prisma.lead.findUnique({ where: { id: leadId } });
      if (!lead) throw new Error('Lead não encontrado');

      // 2. Buscar dados da Propriedade (Pousada remetente ou ZEHLA Central)
      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) throw new Error('Propriedade não encontrada');

      // 3. Buscar Sinais de Tendência
      const trends = await prisma.trendSignal.findMany({
        where: { id: { in: trendSignalIds } }
      });

      // 4. Construir Contexto de Tendências
      const trendsContext = trends.map(t => `- ${t.keyword} (${t.category}): ${t.deltaPercent.toFixed(1)}% de aumento.`).join('\n');
      
      // 5. Prompt de Síntese
      const prompt = `
        Você é um estrategista de conversão da ZEHLA SmartHotel.
        Gere uma mensagem de abordagem para WhatsApp altamente persuasiva e personalizada.

        ---
        CONTEXTO DO REMETENTE (ZEHLA):
        - Foco: Automatizar reservas diretas e eliminar comissões de OTAs (Booking/Expedia).
        - Diferencial: Inteligência de Sinais de Mercado (Camada 0).

        DADOS DO LEAD (PROPRIETÁRIO DE POUSADA):
        - Nome: ${lead.name || 'Proprietário'}
        - Pousada: ${lead.property || 'sua pousada'}
        - Localização: ${lead.city || 'região'}, ${lead.state || ''}
        - Comportamento: ${lead.buyingBehavior || 'procura por ocupação direta'}

        TENDÊNCIAS DETECTADAS EM TEMPO REAL:
        ${trendsContext || 'Alta procura geral por hospitalidade na região.'}

        ---
        REGRAS DE OURO:
        - Use o nome do lead se disponível.
        - Não pareça um robô. Seja consultivo.
        - Use as tendências acima para criar senso de urgência.
        - Foque na "DOR": Perder reservas para concorrentes ou pagar comissões altas.
        - Call to Action: Uma pergunta que incite resposta imediata.
        - Máximo 400 caracteres.
        - Não use emojis em excesso.

        SAÍDA:
        Apenas o texto da mensagem.
      `;

      // 6. Chamada ao Roteador de LLM (Prioridade Kimi 2.6 / Qwen)
      const response = await freeLLMRouter.generate({
        messages: [
          { role: 'system', content: 'Você é um assistente de vendas de elite focado em hospitalidade.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        maxTokens: 500
      });

      return response.content.trim();
    } catch (error) {
      console.error('❌ [SWIPE-GEN] Erro na geração de swipe:', error);
      return null;
    }
  }
}
