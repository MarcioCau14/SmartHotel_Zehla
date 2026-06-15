/**
 * ZEHLA SMARTHOTEL — BudgetCircuitBreaker Domain Service
 * Módulo: src/domain/decision/services/BudgetCircuitBreaker.ts
 */

import { BudgetGuard, BudgetSnapshot, BudgetLevel } from '../models/BudgetGuard';
import { ICacheRepository } from '../../shared/ports/ICacheRepository';
import { Result } from '../../../shared/Result';

export class BudgetCircuitBreaker {
  private readonly guard: BudgetGuard;
  private readonly cacheRepo?: ICacheRepository;

  constructor(cacheRepo?: ICacheRepository, guard?: BudgetGuard) {
    this.cacheRepo = cacheRepo;
    this.guard = guard ?? new BudgetGuard();
  }

  hasCache(): boolean {
    return !!this.cacheRepo;
  }

  // 1. Validação síncrona antes de liberar o tráfego pro LLM
  async isTrafficAllowed(tenantId: string, dailyBudget: number): Promise<Result<void, Error>> {
    if (!this.cacheRepo) {
      return Result.ok(undefined);
    }
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const cacheKey = `finops:cost:${tenantId}:${todayStr}`;
      
      const getResult = await this.cacheRepo.get(cacheKey);
      const currentCost = getResult.isOk && getResult.value ? parseFloat(getResult.value) : 0;

      if (currentCost >= (dailyBudget * 0.95)) {
        console.warn(`[FinOps Breaker] Tenant ${tenantId} atingiu 95% do limite (${currentCost}/${dailyBudget}).`);
        return Result.fail<void, Error>(new Error('FINOPS_CIRCUIT_OPEN'));
      }

      return Result.ok(undefined);
    } catch (error: any) {
      return Result.ok(undefined); // Degradabilidade amigável
    }
  }

  // 2. Incremento atômico imediatamente após a IA responder
  async addTokenCost(tenantId: string, costInUsd: number): Promise<void> {
    if (!this.cacheRepo) return;
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const dailyCostKey = `finops:cost:${tenantId}:${todayStr}`;
      await this.cacheRepo.incrementByFloat(dailyCostKey, costInUsd, 86400); // TTL 24h

      const currentMonthStr = todayStr.substring(0, 7); // YYYY-MM
      const monthlyCostKey = `finops:cost:${tenantId}:monthly:${currentMonthStr}`;
      await this.cacheRepo.incrementByFloat(monthlyCostKey, costInUsd, 86400 * 30); // TTL 30 dias
    } catch (error) {
      console.error('[FinOps Breaker] Erro ao incrementar custo do token no Redis:', error);
    }
  }

  // Auxiliar para obter a Snapshot do cache em tempo real
  async fetchSnapshot(
    tenantId: string,
    dailyBudgetUsd: number,
    monthlyBudgetUsd: number
  ): Promise<BudgetSnapshot> {
    if (!this.cacheRepo) {
      return {
        dailySpendUsd: 0,
        dailyBudgetUsd,
        monthlySpendUsd: 0,
        monthlyBudgetUsd,
      };
    }
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const dailyCostKey = `finops:cost:${tenantId}:${todayStr}`;
      const dailyCostResult = await this.cacheRepo.get(dailyCostKey);
      const dailySpendUsd = dailyCostResult.isOk && dailyCostResult.value 
        ? parseFloat(dailyCostResult.value) 
        : 0;

      const currentMonthStr = todayStr.substring(0, 7);
      const monthlyCostKey = `finops:cost:${tenantId}:monthly:${currentMonthStr}`;
      const monthlyCostResult = await this.cacheRepo.get(monthlyCostKey);
      const monthlySpendUsd = monthlyCostResult.isOk && monthlyCostResult.value 
        ? parseFloat(monthlyCostResult.value) 
        : 0;

      return {
        dailySpendUsd,
        dailyBudgetUsd,
        monthlySpendUsd,
        monthlyBudgetUsd,
      };
    } catch {
      return {
        dailySpendUsd: 0,
        dailyBudgetUsd,
        monthlySpendUsd: 0,
        monthlyBudgetUsd,
      };
    }
  }

  getAdjustedCost(
    realCostUsd: number,
    tier: 1 | 2 | 3,
    snapshot: BudgetSnapshot
  ): number {
    const level = this.guard.assessLevel(snapshot);
    return this.guard.getAdjustedCost(realCostUsd, tier, level);
  }

  filterAllowedProviders(
    providers: ReadonlyArray<{ name: string; tier: 1 | 2 | 3 }>,
    snapshot: BudgetSnapshot
  ): ReadonlyArray<string> {
    const level = this.guard.assessLevel(snapshot);
    return this.guard.getAllowedProviderNames(providers, level);
  }
}
