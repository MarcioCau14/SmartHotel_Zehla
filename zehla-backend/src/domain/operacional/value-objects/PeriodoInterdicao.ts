import { Result } from '../../../shared/Result'

export class PeriodoInterdicao {
  private constructor(
    public readonly dataInicio: Date,
    public readonly dataFim: Date | undefined,
    public readonly motivo: string,
  ) {
    Object.freeze(this)
  }

  static criar(dados: {
    dataInicio: Date
    dataFim?: Date
    motivo: string
  }): Result<PeriodoInterdicao, Error> {
    if (!dados.dataInicio || !(dados.dataInicio instanceof Date) || isNaN(dados.dataInicio.getTime())) {
      return Result.fail(new Error('Data de início da interdição é obrigatória'))
    }
    if (!dados.motivo || dados.motivo.trim().length === 0) {
      return Result.fail(new Error('Motivo da interdição é obrigatório'))
    }
    if (dados.dataFim) {
      if (!(dados.dataFim instanceof Date) || isNaN(dados.dataFim.getTime())) {
        return Result.fail(new Error('Data fim inválida'))
      }
      if (dados.dataFim <= dados.dataInicio) {
        return Result.fail(new Error('Data fim deve ser posterior à data início'))
      }
    }
    return Result.ok(new PeriodoInterdicao(dados.dataInicio, dados.dataFim, dados.motivo.trim()))
  }

  get estaAtivo(): boolean {
    if (!this.dataFim) return true
    return new Date() < this.dataFim
  }

  encerrar(): PeriodoInterdicao {
    return new PeriodoInterdicao(this.dataInicio, new Date(), this.motivo)
  }

  toString(): string {
    const fim = this.dataFim ? this.dataFim.toISOString() : 'em aberto'
    return `Interdição: ${this.motivo} (${this.dataInicio.toISOString()} → ${fim})`
  }
}
