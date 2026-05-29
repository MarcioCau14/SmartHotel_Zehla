import { Result } from '../../../shared/Result'

export type GravidadeType = 'baixa' | 'media' | 'alta' | 'severa'

const VALORES_VALIDOS: GravidadeType[] = ['baixa', 'media', 'alta', 'severa']

export class Gravidade {
  private constructor(
    public readonly value: GravidadeType,
  ) {
    Object.freeze(this)
  }

  static criar(value: string): Result<Gravidade, Error> {
    if (!value || typeof value !== 'string') {
      return Result.fail(new Error('Gravidade é obrigatória'))
    }
    const normalized = value.toLowerCase().trim() as GravidadeType
    if (!VALORES_VALIDOS.includes(normalized)) {
      return Result.fail(new Error(`Gravidade inválida: ${value}. Valores válidos: ${VALORES_VALIDOS.join(', ')}`))
    }
    return Result.ok(new Gravidade(normalized))
  }

  static baixa(): Gravidade {
    return new Gravidade('baixa')
  }

  static media(): Gravidade {
    return new Gravidade('media')
  }

  static alta(): Gravidade {
    return new Gravidade('alta')
  }

  static severa(): Gravidade {
    return new Gravidade('severa')
  }

  get isSevera(): boolean {
    return this.value === 'severa'
  }

  get isAltaOuSuperior(): boolean {
    return this.value === 'alta' || this.value === 'severa'
  }

  equals(other: Gravidade): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }
}
