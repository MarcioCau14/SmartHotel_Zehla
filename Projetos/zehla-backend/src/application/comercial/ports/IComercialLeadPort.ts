import { Result } from '../../../shared/Result'
import { ComercialLead, EstadoLead } from '../../../domain/comercial/entities/ComercialLead'

export interface IComercialLeadPort {
  buscarPorId(id: string): Promise<Result<ComercialLead | null, Error>>
  salvar(lead: ComercialLead): Promise<Result<ComercialLead, Error>>
  listarPorEstado(estado: EstadoLead): Promise<Result<ComercialLead[], Error>>
}
