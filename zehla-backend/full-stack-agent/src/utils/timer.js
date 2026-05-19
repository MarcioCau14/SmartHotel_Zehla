/**
 * FULL_STACK_AGENT — Timer
 * Performance measurement usando hrtime nativo (zero deps)
 */

/**
 * Cria um novo timer
 * @returns {{ stop: () => number, elapsed: () => number, lap: (label: string) => void }}
 */
export function createTimer() {
  const start = process.hrtime.bigint();
  const laps = [];

  return {
    /** Retorna ms decorridos desde o início */
    elapsed() {
      const ns = process.hrtime.bigint() - start;
      return Number(ns) / 1_000_000;
    },

    /** Registra um lap com label */
    lap(label) {
      laps.push({ label, ms: this.elapsed() });
    },

    /** Para o timer e retorna ms totais */
    stop() {
      const ms = this.elapsed();
      return ms;
    },

    /** Retorna todos os laps registrados */
    getLaps() {
      return laps;
    },

    /** Formata ms para exibição legível */
    format(ms = null) {
      const value = ms ?? this.elapsed();
      if (value < 1000) return `${Math.round(value)}ms`;
      if (value < 60000) return `${(value / 1000).toFixed(1)}s`;
      return `${Math.floor(value / 60000)}m ${Math.round((value % 60000) / 1000)}s`;
    },
  };
}

/**
 * Executa uma função e retorna { result, ms }
 */
export async function measure(fn) {
  const timer = createTimer();
  const result = await fn();
  return { result, ms: timer.stop() };
}

/**
 * Formata bytes para exibição legível
 */
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

/**
 * Retorna uso de memória atual
 */
export function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    rss: formatBytes(mem.rss),
    heapUsed: formatBytes(mem.heapUsed),
    heapTotal: formatBytes(mem.heapTotal),
    external: formatBytes(mem.external),
  };
}
