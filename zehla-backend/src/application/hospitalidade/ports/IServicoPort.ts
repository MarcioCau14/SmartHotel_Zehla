import { Result } from '../../../domain/shared/Result'
import { Servico, CategoriaServico } from '../../../domain/hospitalidade/entities'

export interface IServicoPort {
  getById(serviceId: string): Promise<Result<Servico, Error>>
  listAvailable(): Promise<Result<Servico[], Error>>
  listByCategoria(categoria: CategoriaServico): Promise<Result<Servico[], Error>>
  save(servico: Servico): Promise<Result<Servico, Error>>
}
