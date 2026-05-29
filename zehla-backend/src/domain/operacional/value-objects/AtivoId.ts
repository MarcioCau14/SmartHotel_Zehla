import { Result } from '../../../shared/Result'

export type TipoAtivo = 'quarto' | 'area_comum' | 'equipamento'

const TIPOS_VALIDOS: TipoAtivo[] = ['quarto', 'area_comum', 'equipamento']

export class AtivoId {
  private constructor(
    public readonly id: string,
    public readonly tipo: TipoAtivo,
  ) {
    Object.freeze(this)
  }

  static criar(id: string, tipo: string): Result<AtivoId, Error> {
    if (!id || id.trim().length === 0) {
      return Result.fail(new Error('ID do ativo é obrigatório'))
    }
    const tipoNormalized = tipo.toLowerCase().trim() as TipoAtivo
    if (!TIPOS_VALIDOS.includes(tipoNormalized)) {
      return Result.fail(new Error(`Tipo de ativo inválido: ${tipo}. Valores válidos: ${TIPOS_VALIDOS.join(', ')}`))
    }
    return Result.ok(new AtivoId(id.trim(), tipoNormalized))
  }

  get isQuarto(): boolean {
    return this.tipo === 'quarto'
  }

  equals(other: AtivoId): boolean {
    return this.id === other.id && this.tipo === other.tipo
  }

  toString(): string {
    return `${this.tipo}:${this.id}`
  }
}
