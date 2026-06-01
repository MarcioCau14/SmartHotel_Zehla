/**
 * ZEHLA SMARTHOTEL — ShadowModeManager Domain Service
 * Módulo: src/domain/decision/services/ShadowModeManager.ts
 */

export interface ShadowExecutionMetrics {
  providerName: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export class ShadowModeManager {
  constructor(
    private readonly shadowProviders: ReadonlyArray<string>,
    private readonly executeFn: (provider: string) => Promise<any>,
    private readonly onMetricsLogged?: (metrics: ShadowExecutionMetrics) => void
  ) {}

  /**
   * Dispara a chamada ao provedor shadow de forma assíncrona não-bloqueante.
   * Retorna imediatamente sem esperar a conclusão dos disparos em background.
   */
  fireAndForget(): void {
    for (const provider of this.shadowProviders) {
      this.executeShadow(provider).catch(() => {
        // Silenciar qualquer falha da Promise no topo para evitar quebras do Node
      });
    }
  }

  private async executeShadow(provider: string): Promise<void> {
    const startTime = performance.now();
    let success = false;
    let errorMsg: string | undefined;

    try {
      await this.executeFn(provider);
      success = true;
    } catch (err: any) {
      success = false;
      errorMsg = err?.message || String(err);
    } finally {
      const endTime = performance.now();
      const latencyMs = endTime - startTime;

      if (this.onMetricsLogged) {
        try {
          this.onMetricsLogged({
            providerName: provider,
            latencyMs,
            success,
            error: errorMsg,
          });
        } catch (e) {
          // Prevenir que um erro no logger de métricas quebre a rotina shadow
        }
      }
    }
  }
}
