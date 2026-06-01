/**
 * ZEHLA SMARTHOTEL — AdaptiveStickiness Domain Service
 * Módulo: src/domain/decision/services/AdaptiveStickiness.ts
 */

import { Result } from '../../shared/Result';

export class AdaptiveStickiness {
  private readonly baseStickinessMap: Record<string, number> = {
    Emergency: 0.8,
    Complaint: 0.5,
    Booking: 0.4,
    Pricing: 0.3,
    Semantic: 0.3,
    Content: 0.2,
    Review: 0.2,
    I18N: 0.2,
    FAQ: 0.15,
  };

  calculate(
    category: string,
    turnsCount: number,
    elapsedMs: number,
    sessionDecayFactor = 0.9,
    timeDecayRate = 0.05
  ): Result<number, Error> {
    if (turnsCount < 0) {
      return Result.fail(new Error('turnsCount cannot be negative'));
    }
    if (elapsedMs < 0) {
      return Result.fail(new Error('elapsedMs cannot be negative'));
    }

    const base = this.baseStickinessMap[category] ?? 0.25;
    const sessionFactor = Math.pow(sessionDecayFactor, turnsCount);
    const timeFactor = Math.exp(-timeDecayRate * (elapsedMs / 1000));

    const stickiness = base * sessionFactor * timeFactor;
    // Limit range to [0.01, 0.95]
    const clamped = Math.max(0.01, Math.min(stickiness, 0.95));
    return Result.ok(Math.round(clamped * 1e4) / 1e4);
  }
}
