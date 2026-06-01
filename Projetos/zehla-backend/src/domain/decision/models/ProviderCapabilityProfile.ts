/**
 * ZEHLA SMARTHOTEL — Provider Capability Profile Value Object
 * Módulo: src/domain/decision/models/ProviderCapabilityProfile.ts
 */

export interface ICapabilityVector {
  readonly reasoning: number;       // [0, 1]
  readonly conversation: number;    // [0, 1]
  readonly code: number;           // [0, 1]
  readonly json: number;           // [0, 1]
  readonly creative: number;       // [0, 1]
  readonly multilingual: number;   // [0, 1]
  readonly safety: number;         // [0, 1]
}

export class ProviderCapabilityProfile {
  private constructor(
    public readonly name: string,
    public readonly tier: 1 | 2 | 3,
    public readonly costInputPer1M: number,
    public readonly costOutputPer1M: number,
    public readonly capabilities: Readonly<ICapabilityVector>,
    public readonly slaLatencyMs: number,
    public readonly maxContextTokens: number,
  ) {}

  static create(params: {
    name: string;
    tier: 1 | 2 | 3;
    costInputPer1M: number;
    costOutputPer1M: number;
    capabilities: Readonly<ICapabilityVector>;
    slaLatencyMs: number;
    maxContextTokens: number;
  }): ProviderCapabilityProfile {
    // Validação Fail-Fast
    if (params.tier !== 1 && params.tier !== 2 && params.tier !== 3) {
      throw new Error(`Invalid tier level: ${params.tier}`);
    }
    if (params.costInputPer1M < 0 || params.costOutputPer1M < 0) {
      throw new Error('Costs cannot be negative');
    }
    if (params.slaLatencyMs <= 0 || params.maxContextTokens <= 0) {
      throw new Error('Latency and context tokens must be positive');
    }
    
    // Validar capacidade
    const c = params.capabilities;
    for (const key of Object.keys(c) as Array<keyof ICapabilityVector>) {
      if (c[key] < 0 || c[key] > 1) {
        throw new Error(`Capability ${key} must be in range [0, 1]`);
      }
    }

    return new ProviderCapabilityProfile(
      params.name,
      params.tier,
      params.costInputPer1M,
      params.costOutputPer1M,
      Object.freeze({ ...params.capabilities }),
      params.slaLatencyMs,
      params.maxContextTokens,
    );
  }

  estimateCost(inputTokens: number, outputTokens: number): number {
    if (inputTokens < 0 || outputTokens < 0) {
      throw new Error('Token counts cannot be negative');
    }
    const cost = (inputTokens / 1_000_000) * this.costInputPer1M
               + (outputTokens / 1_000_000) * this.costOutputPer1M;
    return Math.round(cost * 1e10) / 1e10; // Evita imprecisão decimal
  }

  get capabilityScore(): number {
    const c = this.capabilities;
    const score = (c.reasoning + c.conversation + c.code + c.json + c.creative + c.multilingual + c.safety) / 7;
    return Math.round(score * 1e10) / 1e10;
  }
}
