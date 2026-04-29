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
   * Detecta enumeração de IDs (IDOR Attempt)
   */
  private static requestCounts = new Map<string, { count: number, last: number }>();

  static checkRateLimit(ip: string, action: string): boolean {
    const now = Date.now();
    const key = `${ip}:${action}`;
    const data = this.requestCounts.get(key) || { count: 0, last: now };

    if (now - data.last > 60000) { // Reset a cada minuto
      data.count = 0;
      data.last = now;
    }

    data.count++;
    this.requestCounts.set(key, data);

    return data.count <= 50; // Limite de 50 acoes/min
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
