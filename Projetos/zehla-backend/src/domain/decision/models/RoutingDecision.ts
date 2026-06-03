/**
 * ZEHLA SMARTHOTEL — Routing Decision Value Object
 * Módulo: src/domain/decision/models/RoutingDecision.ts
 */

export class RoutingDecision {
  private constructor(
    public readonly bucketId: string,
    public readonly selectedProviderName: string,
    public readonly isEmergencyFallback: boolean,
    public readonly isStickinessApplied: boolean,
    public readonly expectedUtility: number,
    public readonly sampledThetas: ReadonlyMap<string, number>,
    public readonly adjustedCosts: ReadonlyMap<string, number>,
    public readonly decidedAt: number,
  ) {
    // Validação de bucketId de 35 buckets (intervalo [0, 34])
    const bucketNum = parseInt(bucketId, 10);
    if (isNaN(bucketNum) || bucketNum < 0 || bucketNum > 34) {
      throw new Error(`Invalid bucketId: ${bucketId}. BucketId must be in range [0, 34].`);
    }
  }

  static create(params: {
    bucketId: string;
    selectedProviderName: string;
    isEmergencyFallback?: boolean;
    isStickinessApplied?: boolean;
    expectedUtility: number;
    sampledThetas: ReadonlyMap<string, number>;
    adjustedCosts: ReadonlyMap<string, number>;
  }): RoutingDecision {
    return new RoutingDecision(
      params.bucketId,
      params.selectedProviderName,
      params.isEmergencyFallback ?? false,
      params.isStickinessApplied ?? false,
      params.expectedUtility,
      Object.freeze(new Map(params.sampledThetas)),
      Object.freeze(new Map(params.adjustedCosts)),
      Date.now(),
    );
  }

  static emergencyFallback(bucketId: string): RoutingDecision {
    return new RoutingDecision(
      bucketId,
      'rules_engine',
      true,
      false,
      0,
      new Map(),
      new Map(),
      Date.now(),
    );
  }
}
