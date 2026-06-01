import { Result } from '../../../shared/Result'

export type PrioridadeType = 'baixa' | 'media' | 'alta' | 'urgente'

const PESOS: Record<PrioridadeType, number> = {
  baixa: 1,
  media: 2,
  alta: 3,
  urgente: 4,
}

const VALORES_VALIDOS: PrioridadeType[] = ['baixa', 'media', 'alta', 'urgente']

export class Prioridade {
  private constructor(
    public readonly value: PrioridadeType,
    public readonly peso: number,
  ) {
    Object.freeze(this)
  }

  static criar(value: string): Result<Prioridade, Error> {
    if (!value || typeof value !== 'string') {
      return Result.fail(new Error('Prioridade é obrigatória'))
    }
    const normalized = value.toLowerCase().trim() as PrioridadeType
    if (!VALORES_VALIDOS.includes(normalized)) {
      return Result.fail(new Error(`Prioridade inválida: ${value}. Valores válidos: ${VALORES_VALIDOS.join(', ')}`))
    }
    return Result.ok(new Prioridade(normalized, PESOS[normalized]))
  }

  static baixa(): Prioridade {
    return new Prioridade('baixa', PESOS.baixa)
  }

  static media(): Prioridade {
    return new Prioridade('media', PESOS.media)
  }

  static alta(): Prioridade {
    return new Prioridade('alta', PESOS.alta)
  }

  static urgente(): Prioridade {
    return new Prioridade('urgente', PESOS.urgente)
  }

  equals(other: Prioridade): boolean {
    return this.value === other.value
  }

  isMaisUrgenteQue(other: Prioridade): boolean {
    return this.peso > other.peso
  }

  toString(): string {
    return this.value
  }
}
