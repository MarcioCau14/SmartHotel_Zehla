/**
 * ZEHLA SMARTHOTEL — Budget Guard Value Object
 * Módulo: src/domain/decision/models/BudgetGuard.ts
 */

export interface BudgetSnapshot {
  readonly dailySpendUsd: number;
  readonly dailyBudgetUsd: number;
  readonly monthlySpendUsd: number;
  readonly monthlyBudgetUsd: number;
}

export const enum BudgetLevel {
  NORMAL = 'NORMAL',
  WARNING = 'WARNING',   // ≥ 80%
  CRITICAL = 'CRITICAL', // ≥ 95%
}

export class BudgetGuard {
  private readonly warningThreshold: number;
  private readonly criticalThreshold: number;
  private readonly costInflationFactor: number;

  constructor(params?: {
    warningThreshold?: number;
    criticalThreshold?: number;
    costInflationFactor?: number;
  }) {
    this.warningThreshold = params?.warningThreshold ?? 0.80;
    this.criticalThreshold = params?.criticalThreshold ?? 0.95;
    this.costInflationFactor = params?.costInflationFactor ?? 3.0;

    // Auto-validação Fail-Fast
    if (this.warningThreshold <= 0 || this.warningThreshold > 1) {
      throw new Error(`Invalid warningThreshold: ${this.warningThreshold}. Must be in range (0, 1].`);
    }
    if (this.criticalThreshold <= 0 || this.criticalThreshold > 1) {
      throw new Error(`Invalid criticalThreshold: ${this.criticalThreshold}. Must be in range (0, 1].`);
    }
    if (this.costInflationFactor <= 0) {
      throw new Error(`Invalid costInflationFactor: ${this.costInflationFactor}. Must be positive.`);
    }
  }

  assessLevel(snapshot: BudgetSnapshot): BudgetLevel {
    if (snapshot.dailyBudgetUsd <= 0 || snapshot.monthlyBudgetUsd <= 0) {
      throw new Error('Budget limits must be positive');
    }
    if (snapshot.dailySpendUsd < 0 || snapshot.monthlySpendUsd < 0) {
      throw new Error('Spent amounts cannot be negative');
    }

    const dailyRatio = snapshot.dailySpendUsd / snapshot.dailyBudgetUsd;
    const monthlyRatio = snapshot.monthlySpendUsd / snapshot.monthlyBudgetUsd;
    const worstRatio = Math.max(dailyRatio, monthlyRatio);

    if (worstRatio >= this.criticalThreshold) return BudgetLevel.CRITICAL;
    if (worstRatio >= this.warningThreshold) return BudgetLevel.WARNING;
    return BudgetLevel.NORMAL;
  }

  getAdjustedCost(
    realCostUsd: number,
    tier: 1 | 2 | 3,
    budgetLevel: BudgetLevel,
  ): number {
    if (realCostUsd < 0) {
      throw new Error('Cost cannot be negative');
    }
    if (tier !== 1 && tier !== 2 && tier !== 3) {
      throw new Error(`Invalid tier: ${tier}`);
    }

    switch (budgetLevel) {
      case BudgetLevel.CRITICAL:
        return tier >= 2 ? Infinity : realCostUsd;
      case BudgetLevel.WARNING:
        {
          const cost = tier >= 2 ? realCostUsd * this.costInflationFactor : realCostUsd;
          return Math.round(cost * 1e10) / 1e10; // Evita dízimas decimais em ponto flutuante
        }
      default:
        return realCostUsd;
    }
  }

  getAllowedProviderNames(
    allProviders: ReadonlyArray<{ name: string; tier: 1 | 2 | 3 }>,
    budgetLevel: BudgetLevel,
  ): ReadonlyArray<string> {
    if (budgetLevel === BudgetLevel.CRITICAL) {
      return allProviders.filter(p => p.tier === 1).map(p => p.name);
    }
    return allProviders.map(p => p.name);
  }

  getBudgetStatus(snapshot: BudgetSnapshot): {
    dailyRatio: number;
    monthlyRatio: number;
    level: BudgetLevel;
  } {
    return {
      dailyRatio: Math.round((snapshot.dailySpendUsd / snapshot.dailyBudgetUsd) * 1000) / 1000,
      monthlyRatio: Math.round((snapshot.monthlySpendUsd / snapshot.monthlyBudgetUsd) * 1000) / 1000,
      level: this.assessLevel(snapshot),
    };
  }
}
