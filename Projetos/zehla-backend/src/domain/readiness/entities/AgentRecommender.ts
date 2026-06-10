import { Result } from '../../shared/Result';

export interface AgentRecommendation {
  agentName: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  description: string;
  estimatedRoiMultiplier: number;
}

export class AgentRecommender {
  static recommend(
    hasWhatsAppAutomation: boolean,
    hasPMS: boolean,
    samplerStats: Record<1 | 2 | 3, { alpha: number; beta: number; mean: number }>
  ): Result<AgentRecommendation[], Error> {
    try {
      const recommendations: AgentRecommendation[] = [];

      const tier2Conversion = samplerStats[2]?.mean || 0.5;
      const tier3Conversion = samplerStats[3]?.mean || 0.3;

      if (!hasWhatsAppAutomation) {
        recommendations.push({
          agentName: 'Recepcionista Virtual (WhatsApp AI)',
          priority: 'CRITICAL',
          description: `Seu canal de atendimento está 100% manual. Com base no histórico de conversão de 60s do roteador (Conversão: ${(tier2Conversion * 100).toFixed(0)}%), este agente triará contatos e automatizará pre-check-in imediatamente.`,
          estimatedRoiMultiplier: parseFloat((1.5 + tier2Conversion).toFixed(1))
        });
      } else {
        recommendations.push({
          agentName: 'Recepcionista Virtual (WhatsApp AI)',
          priority: 'MEDIUM',
          description: 'Você já possui automação. Recomendamos otimizar as respostas rápidas baseadas nos padrões de intenção de compra.',
          estimatedRoiMultiplier: 1.1
        });
      }

      if (!hasPMS) {
        recommendations.push({
          agentName: 'Gestor de Ocupação & Tarifas (Revenue AI)',
          priority: 'MEDIUM',
          description: 'A recomendação de pricing dinâmico de alta complexidade está limitada pelo fato de a pousada não utilizar PMS. Recomendamos integrar primeiro um PMS.',
          estimatedRoiMultiplier: 1.2
        });
      } else {
        const priority = tier3Conversion > 0.4 ? 'CRITICAL' : 'HIGH';
        recommendations.push({
          agentName: 'Gestor de Ocupação & Tarifas (Revenue AI)',
          priority: priority as any,
          description: `Com base nas taxas de conversão de IA de raciocínio lógico no roteador (Conversão: ${(tier3Conversion * 100).toFixed(0)}%), o motor de precificação dinâmica automatizada maximizará o RevPAR alterando tarifas de forma inteligente.`,
          estimatedRoiMultiplier: parseFloat((2.0 + tier3Conversion * 2).toFixed(1))
        });
      }

      recommendations.push({
        agentName: 'Social Seller AI (Instagram Auto-responder)',
        priority: 'HIGH',
        description: 'Captação automática de leads a partir de comentários e DMs do Instagram, linkando direto ao funil comercial e ao Pix.',
        estimatedRoiMultiplier: 1.4
      });

      const lgpdPriority = (!hasWhatsAppAutomation) ? 'HIGH' : 'MEDIUM';
      recommendations.push({
        agentName: 'Auditor de LGPD e Privacidade',
        priority: lgpdPriority as any,
        description: 'Varredura de dados em trânsito no WhatsApp e emails da pousada para evitar vazamentos de PII (dados pessoais sensíveis).',
        estimatedRoiMultiplier: 1.0
      });

      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
      const sortedRecommendations = [...recommendations].sort(
        (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
      );

      const frozenRecommendations = Object.freeze(
        sortedRecommendations.map(r => Object.freeze(r))
      ) as unknown as AgentRecommendation[];

      return Result.ok(frozenRecommendations);
    } catch (err: any) {
      return Result.fail(err instanceof Error ? err : new Error(err.message || 'Unknown recommendation error'));
    }
  }
}
