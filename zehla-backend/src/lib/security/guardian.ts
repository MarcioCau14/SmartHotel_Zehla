import { prisma } from '@/lib/prisma';

/**
 * ZEHLA Guardian 2.0 - Circuit Breaker
 * Detecta e bloqueia ações suspeitas antes que causem impacto financeiro ou vazamento de dados.
 */

export class Guardian {
  /**
   * Valida alteração de preço em reservas.
   * Se o novo preço for < 50% do original, bloqueia e loga alerta.
   */
  static async validatePriceUpdate(reservationId: string, newTotal: number): Promise<{ allowed: boolean; reason?: string }> {
    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId }
    });

    if (!reservation) return { allowed: false, reason: 'Reserva não encontrada' };

    const originalPrice = reservation.totalAmount;
    const dropPercentage = ((originalPrice - newTotal) / originalPrice) * 100;

    if (dropPercentage > 50) {
      await this.logSecurityIncident('PRICE_ANOMALY', {
        reservationId,
        originalPrice,
        newTotal,
        dropPercentage,
        severity: 'CRITICAL'
      });
      return { allowed: false, reason: 'Alteração de preço suspeita detectada pelo Guardião.' };
    }

    return { allowed: true };
  }

  /**
   * Detecta enumeração de IDs (IDOR Attempt) e Spam.
   * Utiliza o Redis DB 0 para contagem persistente e global.
   */
  static async checkRateLimit(ip: string, action: string): Promise<boolean> {
    const { redisSession } = await import('@/lib/redis');
    const key = `rate-limit:${action}:${ip}`;
    const limit = 50;
    const windowSeconds = 60;

    try {
      // Incremento atômico no Redis
      const current = await redisSession.incr(key);
      
      // Se for o primeiro acesso, define o TTL de 1 minuto
      if (current === 1) {
        await redisSession.expire(key, windowSeconds);
      }

      const isAllowed = current <= limit;

      if (!isAllowed) {
        console.warn(`🛡️ [GUARDIAN] Rate Limit atingido para ${ip} em ${action}`);
      }

      return isAllowed;
    } catch (error) {
      console.error('❌ [GUARDIAN REDIS ERROR]:', error);
      return true; // Graceful degradation: se o Redis falhar, permite a ação por segurança operacional
    }
  }

  /**
   * Loga incidentes no banco de dados
   */
  private static async logSecurityIncident(type: string, details: any) {
    console.error(`🚨 [SECURITY INCIDENT] ${type}:`, details);
    
    await prisma.systemLog.create({
      data: {
        level: 'CRITICAL',
        component: 'GUARDIAN_2.0',
        message: `Security threat detected: ${type}`,
        metadata: JSON.stringify(details)
      }
    });
  }
}
