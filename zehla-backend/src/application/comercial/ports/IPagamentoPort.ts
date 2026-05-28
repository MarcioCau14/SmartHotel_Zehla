import { Result } from '../../../../shared/Result'
import { Pagamento } from '../../../domain/comercial/entities/Pagamento'
import { Money } from '../../../domain/comercial/value-objects/Money'

export interface IPagamentoPort {
  criarPagamento(dados: {
    propostaId: string
    propriedadeId: string
    valor: Money
    metodoPagamento?: string
  }): Promise<Result<Pagamento, Error>>
  
  buscarPagamentoPorId(id: string, propriedadeId: string): Promise<Result<Pagamento | null, Error>>
  
  listarPagamentosPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Pagamento[], Error>>
  
  listarPagamentosPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Pagamento[], Error>>
  
  atualizarMetodoPagamento(id: string, propriedadeId: string, metodo: string): Promise<Result<Pagamento, Error>>
  
  processarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>>
  
  aprovarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>>
  
  recusarPagamento(id: string, propriedadeId: string, mensagem: string): Promise<Result<Pagamento, Error>>
  
  estornarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>>
  
  reembolsarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>>
}