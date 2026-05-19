/**
 * ZEHLA Blast - Anti-Ban Protocol (Camada 5 - Plugins)
 * 
 * Implementa Jitter Temporal Aleatório e Throttling Inteligente para envio 
 * de mensagens via Chrome Extension (DOM Injection). Mimetiza o comportamento 
 * errático humano no WhatsApp Web, evadindo detecção e bloqueio.
 */

export interface BlastConfig {
  baseDelayMs: number;    // Tempo base entre mensagens (ex: 6000ms = 6 seg)
  jitterPercent: number;  // Variação aleatória (ex: 0.3 = 30%)
  batchSize: number;      // Quantas mensagens mandar antes de uma pausa longa
  batchPauseMs: number;   // Duração da pausa longa simulando "ida ao banheiro" (ex: 300000ms = 5min)
}

export class AntiBanProtocol {
  private config: BlastConfig;
  private messageCount: number = 0;

  constructor(config: BlastConfig) {
    this.config = config;
  }

  /**
   * Calcula o tempo de espera (com Jitter aleatório) para a próxima mensagem.
   */
  public getNextDelay(): number {
    const { baseDelayMs, jitterPercent } = this.config;
    
    // Calcula a variação absoluta baseada na porcentagem (ex: 30% de 6000 = 1800)
    const variation = baseDelayMs * jitterPercent;
    
    // Adiciona ou subtrai a variação aleatoriamente (Jitter entre -1800 e +1800)
    const jitter = (Math.random() * 2 - 1) * variation;
    
    // Delay final garantindo que nunca seja rápido demais (mínimo de 2.5s)
    return Math.max(2500, baseDelayMs + jitter);
  }

  /**
   * Interceptador de fluxo: Aguarda o tempo calculado (ou Pausa de Lote)
   * antes de liberar a execução do disparo no DOM.
   */
  public async waitAndProcess<T>(action: () => Promise<T>): Promise<T> {
    this.messageCount++;

    // Verifica se atingiu o limite do lote para a Pausa Longa (Simulando fadiga)
    if (this.messageCount % this.config.batchSize === 0) {
      . Resfriando pool por ${this.config.batchPauseMs / 1000}s...`);
      await this.sleep(this.config.batchPauseMs);
    } else {
      const delay = this.getNextDelay();
      }ms antes da digitação...`);
      await this.sleep(delay);
    }

    return await action();
  }

  /**
   * Pausa a thread (compatível com Service Workers do Manifest V3)
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
