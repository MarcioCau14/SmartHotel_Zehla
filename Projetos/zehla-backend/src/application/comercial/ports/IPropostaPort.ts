import { Result } from '../../../../shared/Result'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { DateRange } from '../../../domain/hospitalidade/value-objects/DateRange'

export interface IPropostaPort {
  criarProposta(dados: {
    leadId: string
    propriedadeId: string
    pacoteId: string
    dataCheckIn: Date
    dataCheckOut: Date
    quantidadeHospedes: number
    observacoes?: string
  }): Promise<Result<Proposta, Error>>
  
  buscarPropostaPorId(id: string, propriedadeId: string): Promise<Result<Proposta | null, Error>>
  
  listarPropostasPorLead(leadId: string, propriedadeId: string): Promise<Result<Proposta[], Error>>
  
  listarPropostasPorPacote(pacoteId: string, propriedadeId: string): Promise<Result<Proposta[], Error>>
  
  listarPropostasPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Proposta[], Error>>
  
  atualizarProposta(id: string, propriedadeId: string, dados: {
    dataCheckIn?: Date
    dataCheckOut?: Date
    quantidadeHospedes?: number
    observacoes?: string
  }): Promise<Result<Proposta, Error>>
  
  atualizarValorProposta(id: string, propriedadeId: string, valorTotal: Money): Promise<Result<Proposta, Error>>
  
  atualizarSinalProposta(id: string, propriedadeId: string, valorSinal: Money): Promise<Result<Proposta, Error>>
  
  atualizarDescontoProposta(id: string, propriedadeId: string, desconto: Money): Promise<Result<Proposta, Error>>
  
  enviarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>>
  
  visualizarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>>
  
  negociarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>>
  
  aceitarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>>
  
  recusarProposta(id: string, propriedadeId: string, motivo?: string): Promise<Result<Proposta, Error>>
  
  expirarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>>
  
  converterProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>>
}