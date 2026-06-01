import { Result } from '../../shared/Result'

export type TierType = 'isca' | 'front_end' | 'back_end' | 'high_end' | 'complementar'

interface TierConfig {
  nome: string
  ticketMedioMin: number
  ticketMedioMax: number
  publicoAlvo: string
}

const TIER_CONFIGS: Record<TierType, TierConfig> = {
  isca:         { nome: 'Isca',         ticketMedioMin: 0,    ticketMedioMax: 0,    publicoAlvo: 'Todo lead' },
  front_end:    { nome: 'Front-End',    ticketMedioMin: 97,   ticketMedioMax: 197,  publicoAlvo: 'Pequenas pousadas (1-5 quartos)' },
  back_end:     { nome: 'Back-End',     ticketMedioMin: 497,  ticketMedioMax: 997,  publicoAlvo: 'Pousadas médias (5-20 quartos)' },
  high_end:     { nome: 'High-End',     ticketMedioMin: 1997, ticketMedioMax: 4997, publicoAlvo: 'Hotéis e redes (20+ quartos)' },
  complementar: { nome: 'Complementar', ticketMedioMin: 297,  ticketMedioMax: 9997, publicoAlvo: 'Qualquer plano' },
}

export class ProductTier {
  private constructor(
    public readonly tipo: TierType,
    public readonly valorMensal: number
  ) {
    Object.freeze(this)
  }

  static criar(tipo: TierType, valorMensal?: number): Result<ProductTier, Error> {
    if (!TIER_CONFIGS[tipo]) {
      return Result.fail(new Error(`TIER_INVALIDO: tipo '${tipo}' não reconhecido`))
    }
    const config = TIER_CONFIGS[tipo]
    const finalValor = valorMensal ?? (tipo === 'isca' ? 0 : config.ticketMedioMin)

    if (tipo !== 'isca' && (finalValor < config.ticketMedioMin || finalValor > config.ticketMedioMax)) {
      return Result.fail(
        new Error(`VALOR_FORA_FAIXA: ${tipo} deve estar entre R$ ${config.ticketMedioMin} e R$ ${config.ticketMedioMax}`)
      )
    }
    if (tipo === 'isca' && finalValor !== 0) {
      return Result.fail(new Error('ISCA_DEVE_SER_GRATUITA'))
    }
    return Result.ok(new ProductTier(tipo, finalValor))
  }

  get nome(): string {
    return TIER_CONFIGS[this.tipo].nome
  }

  get publicoAlvo(): string {
    return TIER_CONFIGS[this.tipo].publicoAlvo
  }

  podeFazerUpgradePara(outro: ProductTier): boolean {
    const ordem: TierType[] = ['isca', 'front_end', 'back_end', 'high_end']
    const idxAtual = ordem.indexOf(this.tipo)
    const idxAlvo = ordem.indexOf(outro.tipo)
    if (idxAtual === -1 || idxAlvo === -1) return false
    return idxAlvo > idxAtual
  }
}
