import { IPagamentoPort } from '../../../application/comercial/ports/IPagamentoPort'
import { Pagamento } from '../../../domain/comercial/entities/Pagamento'
import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Proposta } from '../../../domain/comercial/entities/Proposta'

export class PagamentoInMemoryRepository implements IPagamentoPort {
  private pagamentos: Map<string, Pagamento> = new Map()

  async criarPagamento(dados: {
    propostaId: string
    propriedadeId: string
    valor: Money
    metodoPagamento?: string
  }): Promise<Result<Pagamento, Error>> {
    try {
      // Gerar ID simples para o pagamento
      const id = `pagamento_${Date.now()}_${Math.floor(Math.random() * 10000)}`
      
      const pagamentoProps = {
        id,
        propostaId: dados.propostaId,
        propriedadeId: dados.propriedadeId,
        valor: dados.valor,
        metodoPagamento: dados.metodoPagamento,
        transactionId: undefined,
        dataCriacao: new Date(),
        dataProcessamento: undefined,
        status: 'rascunho',
        codigoAutorizacao: undefined,
        mensagemRecusa: undefined,
        observacoes: undefined
      }
      
      const pagamentoResult = Pagamento.create(pagamentoProps)
      if (pagamentoResult.isFail) {
        return Result.fail(pagamentoResult.error)
      }
      
      const pagamento = pagamentoResult.value
      this.pagamentos.set(pagamento.id, pagamento)
      
      return Result.ok(pagamento)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating payment'))
    }
  }

  async buscarPagamentoPorId(id: string, propriedadeId: string): Promise<Result<Pagamento | null, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.ok(null)
      }
      
      // Verificar RLS - propriedadeId deve corresponder
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.ok(null)
      }
      
      return Result.ok(pagamento)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding payment by ID'))
    }
  }

  async listarPagamentosPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Pagamento[], Error>> {
    try {
      const pagamentos = Array.from(this.pagamentos.values())
        .filter(p => p.propostaId === propostaId && p.propriedadeId === propriedadeId)
      
      return Result.ok(pagamentos)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing payments by proposal'))
    }
  }

  async listarPagamentosPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Pagamento[], Error>> {
    try {
      let pagamentos = Array.from(this.pagamentos.values())
        .filter(p => p.propriedadeId === propriedadeId && status.includes(p.status))
      
      // Ordenar por data de criação (mais recente primeiro)
      pagamentos.sort((a, b) => b.dataCriacao.getTime() - a.dataCriacao.getTime())
      
      // Aplicar limite se especificado
      if (limite !== undefined && limite > 0) {
        pagamentos = pagamentos.slice(0, limite)
      }
      
      return Result.ok(pagamentos)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing payments by status'))
    }
  }

  async atualizarMetodoPagamento(id: string, propriedadeId: string, metodo: string): Promise<Result<Pagamento, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Verificar RLS
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Payment not found or access denied'))
      }
      
      const pagamentoAtualizado = new Pagamento(
        pagamento.id,
        pagamento.propostaId,
        pagamento.propriedadeId,
        pagamento.valor,
        metodo,
        pagamento.transactionId,
        pagamento.dataCriacao,
        pagamento.dataProcessamento,
        pagamento.status,
        pagamento.codigoAutorizacao,
        pagamento.mensagemRecusa,
        pagamento.observacoes
      )
      
      this.pagamentos.set(id, pagamentoAtualizado)
      
      return Result.ok(pagamentoAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating payment method'))
    }
  }

  async processarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Verificar RLS
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Payment not found or access denied'))
      }
      
      const processarResult = pagamento.processar(transactionId, codigoAutorizacao)
      if (processarResult.isFail) {
        return Result.fail(processarResult.error)
      }
      
      const pagamentoAtualizado = processarResult.value
      this.pagamentos.set(id, pagamentoAtualizado)
      
      return Result.ok(pagamentoAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error processing payment'))
    }
  }

  async aprovarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Verificar RLS
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Payment not found or access denied'))
      }
      
      const aprovarResult = pagamento.aprovar(transactionId, codigoAutorizacao)
      if (aprovarResult.isFail) {
        return Result.fail(aprovarResult.error)
      }
      
      const pagamentoAtualizado = aprovarResult.value
      this.pagamentos.set(id, pagamentoAtualizado)
      
      return Result.ok(pagamentoAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error approving payment'))
    }
  }

  async recusarPagamento(id: string, propriedadeId: string, mensagem: string): Promise<Result<Pagamento, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Verificar RLS
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Payment not found or access denied'))
      }
      
      const recusarResult = pagamento.recusar(mensagem)
      if (recusarResult.isFail) {
        return Result.fail(recusarResult.error)
      }
      
      const pagamentoAtualizado = recusarResult.value
      this.pagamentos.set(id, pagamentoAtualizado)
      
      return Result.ok(pagamentoAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error rejecting payment'))
    }
  }

  async estornarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Verificar RLS
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Payment not found or access denied'))
      }
      
      const estornarResult = pagamento.estornar(motivo)
      if (estornarResult.isFail) {
        return Result.fail(estornarResult.error)
      }
      
      const pagamentoAtualizado = estornarResult.value
      this.pagamentos.set(id, pagamentoAtualizado)
      
      return Result.ok(pagamentoAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error refunding payment'))
    }
  }

  async reembolsarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>> {
    try {
      const pagamento = this.pagamentos.get(id)
      if (!pagamento) {
        return Result.fail(new Error('Payment not found'))
      }
      
      // Verificar RLS
      if (pagamento.propriedadeId !== propriedadeId) {
        return Result.fail(new Error('Payment not found or access denied'))
      }
      
      const reembolsarResult = pagamento.reembolsar(motivo)
      if (reembolsarResult.isFail) {
        return Result.fail(reembolsarResult.error)
      }
      
      const pagamentoAtualizado = reembolsarResult.value
      this.pagamentos.set(id, pagamentoAtualizado)
      
      return Result.ok(pagamentoAtualizado)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error reimbursing payment'))
    }
  }
}