/**
 * ZEHLA SMARTHOTEL — Routing Context Value Object
 * Módulo: src/domain/decision/models/RoutingContext.ts
 */

export class RoutingContext {
  private constructor(
    public readonly inputText: string,
    public readonly sessionId: string,
    public readonly tenantId: string,
    public readonly turnsCount: number,
    public readonly sessionStartMs: number,
    public readonly channel: 'whatsapp' | 'web' | 'email' | 'api',
    public readonly metadata: Readonly<Record<string, unknown>>,
  ) {
    if (turnsCount < 0) {
      throw new Error(`turnsCount must be non-negative: ${turnsCount}`);
    }
    if (sessionStartMs < 0) {
      throw new Error(`sessionStartMs must be non-negative: ${sessionStartMs}`);
    }
  }

  static create(params: {
    inputText: string;
    sessionId: string;
    tenantId: string;
    turnsCount: number;
    sessionStartMs: number;
    channel?: 'whatsapp' | 'web' | 'email' | 'api';
    metadata?: Readonly<Record<string, unknown>>;
  }): RoutingContext {
    return new RoutingContext(
      params.inputText,
      params.sessionId,
      params.tenantId,
      params.turnsCount,
      params.sessionStartMs,
      params.channel ?? 'whatsapp',
      Object.freeze({ ...params.metadata }),
    );
  }

  get elapsedMs(): number {
    return Date.now() - this.sessionStartMs;
  }
}
