/**
 * ZEHLA SMARTHOTEL — BudgetCircuitBreaker Domain Service
 * Módulo: src/domain/decision/services/BudgetCircuitBreaker.ts
 */

import { BudgetGuard, BudgetSnapshot, BudgetLevel } from '../models/BudgetGuard';

export class BudgetCircuitBreaker {
  private readonly guard: BudgetGuard;

  constructor(guard?: BudgetGuard) {
    this.guard = guard ?? new BudgetGuard();
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
