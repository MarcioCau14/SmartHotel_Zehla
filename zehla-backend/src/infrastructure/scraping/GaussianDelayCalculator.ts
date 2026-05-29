export interface GaussianDelayConfig {
  minDelayMs: number
  maxDelayMs: number
  meanMs: number
  stdDevMs: number
}

export class GaussianDelayCalculator {
  private readonly config: GaussianDelayConfig

  constructor(config?: Partial<GaussianDelayConfig>) {
    this.config = {
      minDelayMs: 5000,
      maxDelayMs: 45000,
      meanMs: 25000,
      stdDevMs: 7000,
      ...config,
    }
  }

  getConfig(): GaussianDelayConfig {
    return { ...this.config }
  }

  sample(): number {
    const delay = this.boxMullerTransform()
    return Math.max(
      this.config.minDelayMs,
      Math.min(this.config.maxDelayMs, delay)
    )
  }

  sampleMany(count: number): number[] {
    return Array.from({ length: count }, () => this.sample())
  }

  private boxMullerTransform(): number {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return this.config.meanMs + z * this.config.stdDevMs
  }
}
