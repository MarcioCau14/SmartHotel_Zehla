export class RoutingContext {
  private constructor(
    public readonly inputText: string,
    public readonly sessionId: string,
    public readonly tenantId: string,
    public readonly turnsCount: number,
    public readonly sessionStartMs: number,
    public readonly channel: 'whatsapp' | 'web' | 'email' | 'api',
    public readonly metadata: Readonly<Record<string, unknown>>,
  ) {}

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
