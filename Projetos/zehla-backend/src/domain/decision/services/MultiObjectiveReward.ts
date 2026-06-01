/**
 * ZEHLA SMARTHOTEL — MultiObjectiveReward Domain Service
 * Módulo: src/domain/decision/services/MultiObjectiveReward.ts
 */

import { Result } from '../../shared/Result';

export class MultiObjectiveReward {
  static assess(qualityScore: number, latencyMs: number, slaMs: number): Result<boolean, Error> {
    if (qualityScore < 0 || qualityScore > 1) {
      return Result.fail(new Error(`Invalid qualityScore: ${qualityScore}. Must be in range [0, 1]`));
    }
    if (latencyMs < 0) {
      return Result.fail(new Error(`Invalid latencyMs: ${latencyMs}. Cannot be negative.`));
    }
    if (slaMs <= 0) {
      return Result.fail(new Error(`Invalid slaMs: ${slaMs}. Must be positive.`));
    }

    const success = qualityScore >= 0.6 && latencyMs <= 2 * slaMs;
    return Result.ok(success);
  }
}
