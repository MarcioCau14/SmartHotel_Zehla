import { Result } from '../../shared/Result'
import { Money } from '../value-objects/Money'
import { TipoQuarto, StatusQuarto } from './'

export interface CriarQuartoProps {
  id: string
  tipo: TipoQuarto
  capacidadeMaxima: number
  andar: number
  nome: string
  diariaBase: Money
  amenities?: string[]
  descricao?: string
}

export class Quarto {
  private _status: StatusQuarto
  private _nome: string
  private _diariaBase: Money
  private _amenities: string[]
  private _descricao: string | undefined
  private _dataRetornoManutencao: Date | undefined

  constructor(
    public readonly id: string,
    public readonly tipo: TipoQuarto,
    public readonly capacidadeMaxima: number,
    public readonly andar: number
  ) {
    this._status = StatusQuarto.DISPONIVEL
    this._nome = ''
    this._diariaBase = Money.create(0).value
    this._amenities = []
  }

  static create(props: CriarQuartoProps): Result<Quarto, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ROOM_ID_REQUIRED'))
    }
    if (props.capacidadeMaxima < 1) {
      return Result.fail(new Error('ROOM_INVALID_CAPACITY'))
    }
    if (props.andar < 0) {
      return Result.fail(new Error('ROOM_INVALID_FLOOR'))
    }
    if (props.diariaBase.isZero()) {
      return Result.fail(new Error('ROOM_DAILY_RATE_ZERO'))
    }
    const quarto = new Quarto(props.id.trim(), props.tipo, props.capacidadeMaxima, props.andar)
    quarto._nome = props.nome.trim()
    quarto._diariaBase = props.diariaBase
    quarto._amenities = props.amenities ? [...props.amenities] : []
    quarto._descricao = props.descricao?.trim()
    if (quarto._nome.length === 0) {
      return Result.fail(new Error('ROOM_NAME_REQUIRED'))
    }
    return Result.ok(quarto)
  }

  get status(): StatusQuarto {
    return this._status
  }

  get nome(): string {
    return this._nome
  }

  get diariaBase(): Money {
    return this._diariaBase
  }

  get amenities(): string[] {
    return [...this._amenities]
  }

  get descricao(): string | undefined {
    return this._descricao
  }

  get dataRetornoManutencao(): Date | undefined {
    return this._dataRetornoManutencao
  }

  alterarStatus(novoStatus: StatusQuarto, dataRetorno?: Date): Result<Quarto, Error> {
    if (novoStatus === StatusQuarto.OCUPADO) {
      return Result.fail(new Error('ROOM_OCCUPIED_STATUS_READONLY'))
    }
    if (novoStatus === StatusQuarto.MANUTENCAO && !dataRetorno) {
      return Result.fail(new Error('ROOM_MAINTENANCE_RETURN_DATE_REQUIRED'))
    }
    this._status = novoStatus
    if (dataRetorno) {
      this._dataRetornoManutencao = dataRetorno
    }
    return Result.ok(this)
  }

  ocupar(): Result<Quarto, Error> {
    if (this._status === StatusQuarto.MANUTENCAO) {
      return Result.fail(new Error('ROOM_IN_MAINTENANCE'))
    }
    this._status = StatusQuarto.OCUPADO
    return Result.ok(this)
  }

  liberar(): void {
    this._status = StatusQuarto.DISPONIVEL
  }

  atualizarDiaria(novaDiaria: Money): Result<Quarto, Error> {
    if (novaDiaria.isZero()) {
      return Result.fail(new Error('ROOM_DAILY_RATE_ZERO'))
    }
    this._diariaBase = novaDiaria
    return Result.ok(this)
  }
}
