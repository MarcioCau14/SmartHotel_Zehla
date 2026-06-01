import { Result } from '../../shared/Result'

export type IcpFit = 'ideal' | 'minimo' | 'fora_icp'

export interface BantAnswers {
  budget: boolean
  authority: boolean
  need: boolean
  timeline: boolean
}

export class LeadScore {
  private constructor(
    public readonly valor: number,
    public readonly icpFit: IcpFit,
    public readonly bant: BantAnswers
  ) {
    Object.freeze(this)
  }

  static criar(valor: number, icpFit?: IcpFit, bant?: BantAnswers): Result<LeadScore, Error> {
    if (typeof valor !== 'number' || isNaN(valor)) {
      return Result.fail(new Error('SCORE_INVALID_VALUE'))
    }
    if (valor < 0 || valor > 100) {
      return Result.fail(new Error('SCORE_OUT_OF_RANGE'))
    }
    const finalIcp = icpFit ?? 'fora_icp'
    const finalBant = bant ?? { budget: false, authority: false, need: false, timeline: false }
    return Result.ok(new LeadScore(Math.round(valor), finalIcp, finalBant))
  }

  static calcularScoreBant(bant: BantAnswers): number {
    let score = 0
    if (bant.budget) score += 25
    if (bant.authority) score += 25
    if (bant.need) score += 25
    if (bant.timeline) score += 25
    return score
  }

  static calcularIcpFit(
    faturamentoEstimado?: number,
    setor?: string,
    cargo?: string
  ): IcpFit {
    if (!faturamentoEstimado) return 'fora_icp'
    if (faturamentoEstimado >= 20000) return 'ideal'
    if (faturamentoEstimado >= 5000) return 'minimo'
    return 'fora_icp'
  }

  isQualificado(): boolean {
    return this.valor >= 30 && this.icpFit !== 'fora_icp'
  }

  isAlto(): boolean {
    return this.valor >= 80 && this.icpFit === 'ideal'
  }

  isBaixo(): boolean {
    return this.valor < 30 || this.icpFit === 'fora_icp'
  }

  toString(): string {
    return `${this.valor}/100 [ICP: ${this.icpFit}]`
  }
}
