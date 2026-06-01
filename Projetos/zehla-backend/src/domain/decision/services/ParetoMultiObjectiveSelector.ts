/**
 * ZEHLA SMARTHOTEL — ParetoMultiObjectiveSelector Domain Service
 * Módulo: src/domain/decision/services/ParetoMultiObjectiveSelector.ts
 */

import { Result } from '../../shared/Result';

export interface IParetoCandidate {
  readonly name: string;
  readonly quality: number;      // Mapeado a partir do ProviderCapabilityProfile para o contexto
  readonly adjustedCost: number; // Custo ajustado pelo BudgetGuard
  readonly latencyMs: number;    // Latência de SLA do provedor
}

export class ParetoMultiObjectiveSelector {
  selectRank0(
    candidates: ReadonlyArray<IParetoCandidate>,
    minQuality: number
  ): Result<IParetoCandidate[], Error> {
    if (minQuality < 0 || minQuality > 1) {
      return Result.fail(new Error(`Invalid minQuality: ${minQuality}. Must be in range [0, 1]`));
    }

    // 1. Filtrar provedores que violam a qualidade mínima (minQuality) exigida para aquele bucket
    const filtered = candidates.filter(c => c.quality >= minQuality);

    if (filtered.length === 0) {
      return Result.fail(new Error('No providers met the minimum quality threshold for this bucket'));
    }

    // 2. Encontrar a Fronteira de Pareto (Rank 0 - não-dominados)
    const rank0: IParetoCandidate[] = [];

    for (const c1 of filtered) {
      let isDominated = false;

      for (const c2 of filtered) {
        if (c1 === c2) continue;

        // c2 domina c1 se for melhor ou igual em todas as dimensões, e estritamente melhor em pelo menos uma
        const c2BetterOrEqualInAll = 
          c2.quality >= c1.quality &&
          c2.adjustedCost <= c1.adjustedCost &&
          c2.latencyMs <= c1.latencyMs;

        const c2StrictlyBetterInAny =
          c2.quality > c1.quality ||
          c2.adjustedCost < c1.adjustedCost ||
          c2.latencyMs < c1.latencyMs;

        if (c2BetterOrEqualInAll && c2StrictlyBetterInAny) {
          isDominated = true;
          break;
        }
      }

      if (!isDominated) {
        rank0.push(c1);
      }
    }

    return Result.ok(rank0);
  }
}
