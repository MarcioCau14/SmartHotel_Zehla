import { prisma } from '@/lib/prisma';
import { redisSession } from '@/lib/redis';


/**
 * ZEHLA FinOps Breaker
 * O "Disjuntor Financeiro" que monitora o ROI e o CPL em tempo real.
 * Se o custo de IA ultrapassar a margem de segurança sem gerar conversões, 
 * o sistema entra em modo de degradação (Throttling).
 */

export interface FinOpsStatus {
  shouldThrottle: boolean;
  cpl: number;
  conversionRate: number;
  dailyCost: number;
  reason?: string;
}

export class FinOpsBreaker {
  // Limites de Segurança (Thresholds)
  private static readonly MAX_CPL_USD = 0.50; // Teto de $0.50 por lead
  private static readonly MIN_CONVERSION_RATE = 0.01; // Mínimo 1% de conversão (Paid)
  private static readonly SAFE_BUFFER_CONVERSIONS = 5; // Ignora se houver menos de 5 leads (Warmup)

  /**
   * Registra o custo de uma interação de IA no Redis (DB 0)
   */
  static async recordCost(tenantId: string, cost: number) {
    const key = `finops:daily-cost:${tenantId}:${new Date().toISOString().split('T')[0]}`;
    await redisSession.incrbyfloat(key, cost);
    await redisSession.expire(key, 86400); // 24h
  }

  /**
   * Analisa a saúde financeira do inquilino (CPL vs ROI)
   */
  static async checkStatus(tenantId: string): Promise<FinOpsStatus> {
    const today = new Date().toISOString().split('T')[0];
    const costKey = `finops:daily-cost:${tenantId}:${today}`;
    
    // 1. Obter Custo Acumulado do Dia (Redis)
    const dailyCost = parseFloat(await redisSession.get(costKey) || '0');

    // 2. Obter Leads e Conversões (Prisma)
    const todayStart = new Date();
    todayStart.setHours(0,0,0,0);

    const [leadsCount, paidReservations] = await Promise.all([
      prisma.lead.count({ where: { tenantId, createdAt: { gte: todayStart } } }),
      prisma.payment.count({ 
        where: { 
          propertyId: tenantId, 
          status: 'PAID', 
          createdAt: { gte: todayStart } 
        } 
      })
    ]);

    // 3. Cálculos de Unit Economics
    const cpl = leadsCount > 0 ? dailyCost / leadsCount : 0;
    const conversionRate = leadsCount > 0 ? paidReservations / leadsCount : 0;

    // 4. Lógica do Disjuntor (Circuit Breaker)
    let shouldThrottle = false;
    let reason = '';

    // Se tivermos leads suficientes e a matemática não fechar
    if (leadsCount > this.SAFE_BUFFER_CONVERSIONS) {
      if (cpl > this.MAX_CPL_USD) {
        shouldThrottle = true;
        reason = `CPL_THRESHOLD_EXCEEDED: Custo por lead ($${cpl.toFixed(2)}) acima do limite ($${this.MAX_CPL_USD})`;
      } else if (dailyCost > 10 && conversionRate < this.MIN_CONVERSION_RATE) {
        shouldThrottle = true;
        reason = `LOW_CONVERSION_BREAKER: ROI negativo detectado (Conversão: ${(conversionRate * 100).toFixed(2)}%)`;
      }
    }

    if (shouldThrottle) {
      console.error(`🚨 [FINOPS BREAKER] Tenant ${tenantId} desarmado: ${reason}`);
    }

    return {
      shouldThrottle,
      cpl,
      conversionRate,
      dailyCost,
      reason
    };
  }
}
