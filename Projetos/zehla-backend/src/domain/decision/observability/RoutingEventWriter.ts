/**
 * ZEHLA SMARTHOTEL — Routing Event Writer
 * Módulo: src/domain/decision/observability/RoutingEventWriter.ts
 *
 * Auditoria de decisões com tracing distribuído estruturado em JSON Lines (.jsonl).
 */

import { promises as fs } from 'fs';
import * as path from 'path';

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

export class RoutingEventWriter {
  private readonly logFilePath: string;
  private isInitialized = false;

  constructor(logFilePath = './zehla_data/router_state/logs/router_audit.jsonl') {
    this.logFilePath = logFilePath;
  }

  /**
   * Garante de forma assíncrona que o diretório base existe.
   */
  private async ensureDirectory(): Promise<void> {
    if (this.isInitialized) return;
    const dir = path.dirname(this.logFilePath);
    await fs.mkdir(dir, { recursive: true });
    this.isInitialized = true;
  }

  /**
   * Escreve um evento de decisão de roteamento de forma totalmente assíncrona e não-bloqueante.
   */
  public async writeEvent(event: {
    readonly traceId: string;
    readonly tenantId: string;
    readonly bucketId: string;
    readonly selectedProvider: string;
    readonly utilityScore: number;
    readonly latencyMs: number;
    readonly costAdjusted: number;
    readonly isFallback: boolean;
    readonly timestamp?: number;
  }): Promise<void> {
    await this.ensureDirectory();

    const fullEvent: RoutingEvent = {
      traceId: event.traceId,
      tenantId: event.tenantId,
      bucketId: event.bucketId,
      selectedProvider: event.selectedProvider,
      utilityScore: event.utilityScore,
      latencyMs: event.latencyMs,
      costAdjusted: event.costAdjusted,
      isFallback: event.isFallback,
      timestamp: event.timestamp ?? Date.now(),
    };

    const logLine = JSON.stringify(fullEvent) + '\n';

    // Gravação assíncrona usando promises.appendFile (não bloqueia a main thread)
    await fs.appendFile(this.logFilePath, logLine, 'utf8');
  }

  /**
   * Retorna o caminho do arquivo de log.
   */
  public getLogFilePath(): string {
    return this.logFilePath;
  }
}
