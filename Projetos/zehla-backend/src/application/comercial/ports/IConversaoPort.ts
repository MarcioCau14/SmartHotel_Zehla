import { Result } from '../../../shared/Result'
import { Conversao } from '../../../domain/comercial/entities/Conversao'
import { Lead } from '../../../domain/comercial/entities/Lead'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Pagamento } from '../../../domain/comercial/entities/Pagamento'

export interface IConversaoPort {
  criarConversao(dados: {
    leadId: string
    propostaId: string
    propriedadeId: string
    pagamentoId: string
  }): Promise<Result<Conversao, Error>>
  
  buscarConversaoPorId(id: string, propriedadeId: string): Promise<Result<Conversao | null, Error>>
  
  listarConversoesPorLead(leadId: string, propriedadeId: string): Promise<Result<Conversao[], Error>>
  
  listarConversoesPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Conversao[], Error>>
  
  listarConversoesPorPagamento(pagamentoId: string, propriedadeId: string): Promise<Result<Conversao[], Error>>
  
  listarConversoesPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Conversao[], Error>>
  
  confirmarConversao(id: string, propriedadeId: string): Promise<Result<Conversao, Error>>
  
  cancelarConversao(id: string, propriedadeId: string, motivo: string): Promise<Result<Conversao, Error>>
  
  invalidarConversao(id: string, propriedadeId: string, motivo?: string): Promise<Result<Conversao, Error>>
  
  atualizarDataConversao(id: string, propriedadeId: string, data: Date): Promise<Result<Conversao, Error>>
}