import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { prisma } from '@/lib/prisma';


/**
 * ML INTERACTION LOGGER — Coletor de dados para Machine Learning
 * Captura o tom de voz, métricas de performance e resultados para treinamento contínuo.
 */
export class MLInteractionLogger {
  /**
   * Registra uma interação do ZMG para análise futura e treinamento (RAG/Fine-tuning)
   */
  static async logInteraction(data: {
    tenantId: string;
    leadId?: string;
    messageId?: string;
    content: string;
    response: string;
    modelUsed: string;
    toneAlignmentScore?: number;
    responseTimeMs: number;
    tokensUsed?: number;
    geo?: { city?: string; state?: string; region?: string };
  }) {
    try {
      // 1. Persistir log de interação
      const log = await prisma.mLInteractionLog.create({
        data: {
          tenantId: data.tenantId,
          leadId: data.leadId,
          messageId: data.messageId,
          modelUsed: data.modelUsed,
          toneAlignmentScore: data.toneAlignmentScore,
          responseTimeMs: data.responseTimeMs,
          tokensUsed: data.tokensUsed,
          // Armazenamos o histórico sanitizado e metadados geo
          threadHistory: [
            { role: 'user', content: data.content },
            { role: 'assistant', content: data.response },
            { role: 'system', metadata: { geo: data.geo } }
          ],
        }
      });

      // 2. Inteligência Regional: Alerta se houver muita atividade em uma região nova/crítica
      if (data.geo?.state) {
        await CognitiveTerminal.insight(
          'ML-BRAIN',
          `Interatividade Regional: Lead de ${data.geo.city || 'Desconhecido'}, ${data.geo.state}`,
          { geo: data.geo },
          data.tenantId
        );
      }

      // 2. Emitir Insight se a performance for alta ou baixa
      if (data.toneAlignmentScore && data.toneAlignmentScore < 0.5) {
        await CognitiveTerminal.warn(
          'ML-BRAIN', 
          `Desvio de Tom detectado para tenant ${data.tenantId}`, 
          { score: data.toneAlignmentScore },
          data.tenantId
        );
      }

      if (data.responseTimeMs > 3000) {
        await CognitiveTerminal.warn(
          'ML-BRAIN', 
          `Latência Cognitiva elevada: ${data.responseTimeMs}ms`, 
          { model: data.modelUsed },
          data.tenantId
        );
      }

      return log;
    } catch (error) {
      console.error('🛑 [ML-Logger] Falha ao registrar interação:', error);
    }
  }

  /**
   * Atualiza o resultado de uma interação (ex: reserva confirmada)
   */
  static async updateOutcome(messageId: string, outcome: 'BOOKED' | 'LOST' | 'IGNORED') {
    try {
      await prisma.mLInteractionLog.updateMany({
        where: { messageId },
        data: { outcome }
      });

      await CognitiveTerminal.insight(
        'ML-BRAIN',
        `Outcome atualizado: ${outcome} para mensagem ${messageId}`,
        { outcome }
      );
    } catch (error) {
      console.error('🛑 [ML-Logger] Falha ao atualizar outcome:', error);
    }
  }
}
