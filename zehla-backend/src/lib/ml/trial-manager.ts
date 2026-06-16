import { prisma } from '@/lib/prisma';
import { ZMG } from '@/lib/zmg/core';
import { CognitiveTerminal } from '@/lib/observability/cognitive-terminal';
import { addDays } from 'date-fns';

/**
 * TrialManager — Gestor de Ciclo de Vida do Trial ZEHLA
 * Responsável por notificações de expiração (Dia 6) e bloqueios (Dia 7).
 */
export class TrialManager {
  
  /**
   * Executa a verificação diária de expiração
   */
  static async checkExpirations() {
    const now = new Date();
    
    // 1. Notificação de Dia 6 (24h-48h antes de expirar)
    const propertiesToNotify = await prisma.property.findMany({
      where: {
        isTrial: true,
        trialEndsAt: {
          lte: addDays(now, 2),
          gte: now
        }
      }
    });

    for (const prop of propertiesToNotify) {
      const trialData = (prop.trialJson as any) || {};
      if (!trialData.trialNotificationSent) {
        await this.sendExpiryNotification(prop.id, prop.name, trialData);
      }
    }

    // 2. Bloqueio de Dia 7 (Passou do trialEndsAt)
    const expiredProperties = await prisma.property.findMany({
      where: {
        isTrial: true,
        trialEndsAt: {
          lt: now
        },
        status: 'ACTIVE'
      }
    });

    for (const prop of expiredProperties) {
      await this.expireTrial(prop.id);
    }
  }

  /**
   * Envia notificação amigável via ZMG
   */
  private static async sendExpiryNotification(propertyId: string, propertyName: string, currentTrialData: any) {
    CognitiveTerminal.info(`🔔 [TrialManager] Enviando notificação de 24h para ${propertyName}`, propertyId);

    try {
      await ZMG.receive({
        agentId: 'ZCC-SYSTEM',
        propertyId,
        messageType: 'transactional',
        objective: 'alert' as any, // Trigger para template de expiração
        context: {
          customVariables: {
            property_name: propertyName,
            trial_end_date: 'amanhã'
          }
        }
      });

      const updatedTrialData = {
        ...currentTrialData,
        trialNotificationSent: true
      };

      await prisma.property.update({
        where: { id: propertyId },
        data: { trialJson: updatedTrialData }
      });

    } catch (error) {
      CognitiveTerminal.error(`❌ [TrialManager] Erro ao enviar notificação para ${propertyName}`, propertyId, error);
    }
  }

  /**
   * Bloqueia o acesso e altera o plano para LITE ou solicita cartão
   */
  private static async expireTrial(propertyId: string) {
    CognitiveTerminal.warn(`🔒 [TrialManager] Trial expirado para a propriedade ${propertyId}`, propertyId);

    await prisma.property.update({
      where: { id: propertyId },
      data: { 
        status: 'TRIAL_EXPIRED',
        isTrial: false,
      }
    });

    // Notificação final de bloqueio
    await ZMG.receive({
      agentId: 'ZCC-SYSTEM',
      propertyId,
      messageType: 'alert' as any,
      objective: 'alert' as any,
      context: {
        customVariables: {
          action: 'trial_expired_lock'
        }
      }
    });
  }
}
