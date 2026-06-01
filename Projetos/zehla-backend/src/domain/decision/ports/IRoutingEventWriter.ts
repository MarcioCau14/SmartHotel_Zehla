/**
 * ZEHLA SMARTHOTEL — Routing Event Writer Port (Inversion of Control)
 * Módulo: src/domain/decision/ports/IRoutingEventWriter.ts
 */

export interface RoutingEvent {
  readonly traceId: string;
  readonly tenantId: string;
  readonly bucketId: string;
  readonly selectedProvider: string;
  readonly utilityScore: number;
  readonly latencyMs: number;
  readonly costAdjusted: number;
  readonly isFallback: boolean;
  readonly timestamp: number;
}

export interface IRoutingEventWriter {
  /**
   * Persiste um evento de roteamento estruturado.
   */
  writeEvent(event: RoutingEvent): Promise<void>;
}
