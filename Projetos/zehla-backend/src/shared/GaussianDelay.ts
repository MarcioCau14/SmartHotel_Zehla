/**
 * Gera um atraso Gaussiano (Box-Muller) para delays naturais
 * que mimetizam digitação humana, prevenindo banimento da Meta.
 *
 * Média: (min + max) / 2
 * Desvio padrão: (max - min) / 6  (~99.7% dentro do intervalo)
 */
export function gaussianDelayMs(minMs: number = 5000, maxMs: number = 45000): number {
  const mean = (minMs + maxMs) / 2
  const stdDev = (maxMs - minMs) / 6

  // Box-Muller transform
  const u1 = Math.random()
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)

  const delay = mean + z * stdDev

  return Math.round(Math.min(Math.max(delay, minMs), maxMs))
}

export async function waitGaussian(minMs: number = 5000, maxMs: number = 45000): Promise<void> {
  const delay = gaussianDelayMs(minMs, maxMs)
  return new Promise(resolve => setTimeout(resolve, delay))
}
