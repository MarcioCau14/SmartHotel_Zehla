export class BetaBinomialPosterior {
  private constructor(
    public readonly alpha: number,
    public readonly beta: number,
    public readonly nObservations: number,
    public readonly lastUpdateAt: number,
  ) {}

  static readonly UNIFORM = new BetaBinomialPosterior(1.0, 1.0, 0, 0);

  static create(
    alpha: number,
    beta: number,
    nObservations: number,
    lastUpdateAt: number,
  ): BetaBinomialPosterior {
    if (alpha <= 0 || beta <= 0) {
      throw new Error(`Invalid Beta parameters: alpha=${alpha}, beta=${beta}. Both must be > 0.`);
    }
    return new BetaBinomialPosterior(alpha, beta, nObservations, lastUpdateAt);
  }

  static fromBenchmarkPriors(
    capability: number,
    pseudoCount: number = 10,
  ): BetaBinomialPosterior {
    const alpha = capability * pseudoCount + 1;
    const beta = (1 - capability) * pseudoCount + 1;
    return BetaBinomialPosterior.create(alpha, beta, 0, 0);
  }

  update(success: boolean): BetaBinomialPosterior {
    return BetaBinomialPosterior.create(
      success ? this.alpha + 1 : this.alpha,
      success ? this.beta : this.beta + 1,
      this.nObservations + 1,
      Date.now(),
    );
  }

  decay(factor: number): BetaBinomialPosterior {
    const preservedAlpha = 1.0;
    const preservedBeta = 1.0;
    return BetaBinomialPosterior.create(
      preservedAlpha + factor * (this.alpha - preservedAlpha),
      preservedBeta + factor * (this.beta - preservedBeta),
      this.nObservations,
      Date.now(),
    );
  }

  sample(prng: () => number = Math.random): number {
    if (this.alpha > 1 && this.beta > 1) {
      const x = this._sampleGamma(this.alpha, prng);
      const y = this._sampleGamma(this.beta, prng);
      if (x + y === 0) return 0;
      return x / (x + y);
    }
    return this._johnkAlgorithm(prng);
  }

  get mean(): number {
    return this.alpha / (this.alpha + this.beta);
  }

  get variance(): number {
    const total = this.alpha + this.beta;
    return (this.alpha * this.beta) / (total * total * (total + 1));
  }

  get uncertainty(): number {
    return Math.min(this.variance * (this.alpha + this.beta), 1.0);
  }

  get mode(): number {
    if (this.alpha > 1 && this.beta > 1) {
      return (this.alpha - 1) / (this.alpha + this.beta - 2);
    }
    return this.mean;
  }

  restoreFromSnapshot(
    alpha: number,
    beta: number,
    nObservations: number,
    lastUpdateAt: number,
  ): BetaBinomialPosterior {
    return BetaBinomialPosterior.create(alpha, beta, nObservations, lastUpdateAt);
  }

  private _sampleGamma(a: number, prng: () => number): number {
    // Marsaglia and Tsang (2000) method for generating Gamma(a, 1)
    const d = a - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);

    while (true) {
      let x: number;
      let v: number;

      while (true) {
        x = this._randn(prng);
        v = 1 + c * x;
        if (v > 0) break;
      }

      v = v * v * v;
      const u = prng();

      if (u < 1 - 0.0331 * (x * x) * (x * x)) return d * v;

      if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
        return d * v;
      }
    }
  }

  private _johnkAlgorithm(prng: () => number): number {
    // Johnk's algorithm for Beta(a,b) when a <= 1 or b <= 1
    while (true) {
      const u = Math.pow(prng(), 1 / this.alpha);
      const v = Math.pow(prng(), 1 / this.beta);

      if (u + v <= 1) {
        if (u + v === 0) continue;
        return u / (u + v);
      }
    }
  }

  private _randn(prng: () => number): number {
    // Box-Muller transform
    const u1 = prng();
    const u2 = prng();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}
