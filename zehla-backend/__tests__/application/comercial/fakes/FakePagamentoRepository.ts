import { IPagamentoPort } from '../../../../src/application/comercial/ports/IPagamentoPort'
import { Pagamento, PagamentoStatus } from '../../../../src/domain/comercial/entities/Pagamento'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Result } from '../../../../src/shared/Result'

export class FakePagamentoRepository implements IPagamentoPort {
  public pagamentos: Pagamento[] = []

  async criarPagamento(dados: {
    propostaId: string
    propriedadeId: string
    valor: Money
    metodoPagamento?: string
  }): Promise<Result<Pagamento, Error>> {
    try {
      const id = `pagamento_${Math.random().toString(36).substr(2, 9)}`

      const pagamentoResult = Pagamento.create({
        id,
        propostaId: dados.propostaId,
        propriedadeId: dados.propriedadeId,
        valor: dados.valor,
        metodoPagamento: dados.metodoPagamento || 'pix',
        status: 'rascunho',
        dataCriacao: new Date()
      })

      if (pagamentoResult.isFail) return Result.fail(pagamentoResult.error)

      this.pagamentos.push(pagamentoResult.value)
      return Result.ok(pagamentoResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error creating payment in fake repo'))
    }
  }

  async buscarPagamentoPorId(id: string, propriedadeId: string): Promise<Result<Pagamento | null, Error>> {
    const pagamento = this.pagamentos.find(p => p.id === id && p.propriedadeId === propriedadeId)
    return Result.ok(pagamento || null)
  }

  async listarPagamentosPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Pagamento[], Error>> {
    const list = this.pagamentos.filter(p => p.propostaId === propostaId && p.propriedadeId === propriedadeId)
    return Result.ok(list)
  }

  async listarPagamentosPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Pagamento[], Error>> {
    let result = this.pagamentos.filter(p => p.propriedadeId === propriedadeId && status.includes(p.status))
    if (limite !== undefined) {
      result = result.slice(0, limite)
    }
    return Result.ok(result)
  }

  async atualizarMetodoPagamento(id: string, propriedadeId: string, metodo: string): Promise<Result<Pagamento, Error>> {
    const index = this.pagamentos.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Payment not found'))
    const current = this.pagamentos[index]

    const result = Pagamento.create({
      id: current.id,
      propostaId: current.propostaId,
      propriedadeId: current.propriedadeId,
      valor: current.valor,
      metodoPagamento: metodo,
      transactionId: current.transactionId,
      dataCriacao: current.dataCriacao,
      dataProcessamento: current.dataProcessamento,
      status: current.status,
      codigoAutorizacao: current.codigoAutorizacao,
      mensagemRecusa: current.mensagemRecusa,
      observacoes: current.observacoes
    })

    if (result.isFail) return Result.fail(result.error)
    this.pagamentos[index] = result.value
    return Result.ok(result.value)
  }

  async processarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>> {
    const index = this.pagamentos.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Payment not found'))
    const current = this.pagamentos[index]

    const transicaoResult = current.processar()
    if (transicaoResult.isFail) return Result.fail(transicaoResult.error)

    this.pagamentos[index] = transicaoResult.value
    return Result.ok(transicaoResult.value)
  }

  async aprovarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>> {
    const index = this.pagamentos.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Payment not found'))
    const current = this.pagamentos[index]

    // aprovar
    const transicaoResult = current.aprovar(transactionId, codigoAutorizacao)
    if (transicaoResult.isFail) return Result.fail(transicaoResult.error)

    this.pagamentos[index] = transicaoResult.value
    return Result.ok(transicaoResult.value)
  }

  async recusarPagamento(id: string, propriedadeId: string, mensagem: string): Promise<Result<Pagamento, Error>> {
    const index = this.pagamentos.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Payment not found'))
    const current = this.pagamentos[index]

    const transicaoResult = current.recusar(mensagem)
    if (transicaoResult.isFail) return Result.fail(transicaoResult.error)

    this.pagamentos[index] = transicaoResult.value
    return Result.ok(transicaoResult.value)
  }

  async estornarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>> {
    const index = this.pagamentos.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Payment not found'))
    const current = this.pagamentos[index]

    const transicaoResult = current.estornar()
    if (transicaoResult.isFail) return Result.fail(transicaoResult.error)

    this.pagamentos[index] = transicaoResult.value
    return Result.ok(transicaoResult.value)
  }

  async reembolsarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>> {
    const index = this.pagamentos.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Payment not found'))
    const current = this.pagamentos[index]

    const transicaoResult = current.reembolsar()
    if (transicaoResult.isFail) return Result.fail(transicaoResult.error)

    this.pagamentos[index] = transicaoResult.value
    return Result.ok(transicaoResult.value)
  }

  // Auxiliar para testes
  public addPagamentoDirectly(pagamento: Pagamento): void {
    const index = this.pagamentos.findIndex(p => p.id === pagamento.id)
    if (index !== -1) {
      this.pagamentos[index] = pagamento
    } else {
      this.pagamentos.push(pagamento)
    }
  }
}
