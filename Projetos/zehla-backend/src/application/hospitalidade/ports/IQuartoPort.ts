import { Result } from '../../../domain/shared/Result'
import { Quarto, TipoQuarto, StatusQuarto } from '../../../domain/hospitalidade/entities'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'

export interface IQuartoPort {
  getById(roomId: string): Promise<Result<Quarto, Error>>
  listAvailable(periodo: DateRange, capacidadeMinima?: number): Promise<Result<Quarto[], Error>>
  listByTipo(tipo: TipoQuarto): Promise<Result<Quarto[], Error>>
  save(quarto: Quarto): Promise<Result<Quarto, Error>>
  updateStatus(roomId: string, status: StatusQuarto): Promise<Result<Quarto, Error>>
}
