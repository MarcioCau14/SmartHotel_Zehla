/**
 * ZEHLA SMARTHOTEL — File System Routing Event Writer Adapter
 * Módulo: src/infrastructure/observability/FileSystemRoutingEventWriter.ts
 *
 * Persistência assíncrona não-bloqueante de auditoria no formato JSON Lines (.jsonl).
 */

import { promises as fs } from 'fs';
import * as path from 'path';
import { IRoutingEventWriter, RoutingEvent } from '../../domain/decision/ports/IRoutingEventWriter';

export class FileSystemRoutingEventWriter implements IRoutingEventWriter {
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
   * Escreve o evento no sistema de arquivos em formato JSON Lines de forma não-bloqueante.
   */
  public async writeEvent(event: RoutingEvent): Promise<void> {
    await this.ensureDirectory();

    const logLine = JSON.stringify(event) + '\n';

    // fs.promises.appendFile executa E/S assíncrona delegada à thread pool do Node (libuv),
    // liberando imediatamente a thread de execução principal (event loop) do roteador.
    await fs.appendFile(this.logFilePath, logLine, 'utf8');
  }

  /**
   * Retorna o caminho do arquivo de log estruturado.
   */
  public getLogFilePath(): string {
    return this.logFilePath;
  }
}
