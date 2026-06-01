import { Result } from '../../../domain/shared/Result'
import { Hospede } from '../../../domain/hospitalidade/entities'

export interface IHospedePort {
  getById(guestId: string): Promise<Result<Hospede, Error>>
  getByDocument(documentoValor: string): Promise<Result<Hospede, Error>>
  search(query: string): Promise<Result<Hospede[], Error>>
  save(hospede: Hospede): Promise<Result<Hospede, Error>>
  delete(guestId: string): Promise<Result<void, Error>>
}
