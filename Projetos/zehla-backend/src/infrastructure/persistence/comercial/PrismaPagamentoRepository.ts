import { PrismaClient } from '@prisma/client'
import { IPagamentoPort } from '../../../application/comercial/ports/IPagamentoPort'
import { Pagamento } from '../../../domain/comercial/entities/Pagamento'
import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'

export class PrismaPagamentoRepository implements IPagamentoPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(pagamento: Pagamento): any {
    return {
      id: pagamento.id,
      propostaId: pagamento.propostaId,
      propriedadeId: pagamento.propriedadeId,
      valor: pagamento.valor.centavos,
      metodoPagamento: pagamento.metodoPagamento || null,
      transactionId: pagamento.transactionId || null,
      dataCriacao: pagamento.dataCriacao || null,
      dataProcessamento: pagamento.dataProcessamento || null,
      status: pagamento.status,
      codigoAutorizacao: pagamento.codigoAutorizacao || null,
      mensagemRecusa: pagamento.mensagemRecusa || null,
      observacoes: pagamento.observacoes || null
    }
  }

  private hydrate(row: any): Result<Pagamento, Error> {
    try {
      const valorResult = Money.criar(row.valor)
      if (valorResult.isFail) return Result.fail(valorResult.error)

      const props = {
        id: row.id,
        propostaId: row.propostaId,
        propriedadeId: row.propriedadeId,
        valor: valorResult.value,
        metodoPagamento: row.metodoPagamento || undefined,
        transactionId: row.transactionId || undefined,
        dataCriacao: row.dataCriacao || undefined,
        dataProcessamento: row.dataProcessamento || undefined,
        status: row.status as any,
        codigoAutorizacao: row.codigoAutorizacao || undefined,
        mensagemRecusa: row.mensagemRecusa || undefined,
        observacoes: row.observacoes || undefined
      }

      return Pagamento.create(props)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error hydrating ComercialPagamento'))
    }
  }

  async criarPagamento(dados: {
    propostaId: string
    propriedadeId: string
    valor: Money
    metodoPagamento?: string
  }): Promise<Result<Pagamento, Error>> {
    try {
      const id = `pagamento_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const props = {
        id,
        propostaId: dados.propostaId,
        propriedadeId: dados.propriedadeId, // RLS
        valor: dados.valor,
        metodoPagamento: dados.metodoPagamento || 'PIX',
        transactionId: undefined,
        dataCriacao: new Date(),
        dataProcessamento: undefined,
        status: 'rascunho' as const,
        codigoAutorizacao: undefined,
        mensagemRecusa: undefined,
        observacoes: undefined
      }

      const pagamentoResult = Pagamento.create(props)
      if (pagamentoResult.isFail) return Result.fail(pagamentoResult.error)

      const pagamento = pagamentoResult.value
      const data = this.toData(pagamento)

      await this.prisma.comercialPagamento.create({ data })

      return Result.ok(pagamento)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating payment'))
    }
  }

  async buscarPagamentoPorId(id: string, propriedadeId: string): Promise<Result<Pagamento | null, Error>> {
    try {
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialPagamento.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const pagamentoResult = this.hydrate(row)
      if (pagamentoResult.isFail) return Result.fail(pagamentoResult.error)

      return Result.ok(pagamentoResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding payment by ID'))
    }
  }

  async listarPagamentosPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Pagamento[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialPagamento.findMany({
        where: {
          propostaId,
          propriedadeId
        }
      })

      const pagamentos: Pagamento[] = []
      for (const row of rows) {
        const pResult = this.hydrate(row)
        if (pResult.isFail) return Result.fail(pResult.error)
        pagamentos.push(pResult.value)
      }

      return Result.ok(pagamentos)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing payments by proposal'))
    }
  }

  async listarPagamentosPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Pagamento[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialPagamento.findMany({
        where: {
          propriedadeId,
          status: { in: status }
        },
        take: limite
      })

      const pagamentos: Pagamento[] = []
      for (const row of rows) {
        const pResult = this.hydrate(row)
        if (pResult.isFail) return Result.fail(pResult.error)
        pagamentos.push(pResult.value)
      }

      return Result.ok(pagamentos)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing payments by status'))
    }
  }

  async atualizarMetodoPagamento(id: string, propriedadeId: string, metodo: string): Promise<Result<Pagamento, Error>> {
    try {
      const row = await this.prisma.comercialPagamento.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Payment not found or access denied'))

      const pResult = this.hydrate(row)
      if (pResult.isFail) return Result.fail(pResult.error)

      const updatedProps = {
        id: pResult.value.id,
        propostaId: pResult.value.propostaId,
        propriedadeId: pResult.value.propriedadeId,
        valor: pResult.value.valor,
        metodoPagamento: metodo,
        transactionId: pResult.value.transactionId,
        dataCriacao: pResult.value.dataCriacao,
        dataProcessamento: pResult.value.dataProcessamento,
        status: pResult.value.status,
        codigoAutorizacao: pResult.value.codigoAutorizacao,
        mensagemRecusa: pResult.value.mensagemRecusa,
        observacoes: pResult.value.observacoes
      }

      const updatedResult = Pagamento.create(updatedProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedPagamento = updatedResult.value
      const data = this.toData(updatedPagamento)

      await this.prisma.comercialPagamento.update({
        where: { id },
        data
      })

      return Result.ok(updatedPagamento)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating payment method'))
    }
  }

  async atualizarComData(id: string, propriedadeId: string, p: Pagamento): Promise<Result<Pagamento, Error>> {
    try {
      const data = this.toData(p)
      await this.prisma.comercialPagamento.update({
        where: { id, propriedadeId },
        data
      })
      const row = await this.prisma.comercialPagamento.findUnique({ where: { id } })
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating payment state'))
    }
  }

  async processarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>> {
    try {
      const row = await this.prisma.comercialPagamento.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Payment not found or access denied'))

      const pResult = this.hydrate(row)
      if (pResult.isFail) return Result.fail(pResult.error)

      const transResult = pResult.value.processar(transactionId, codigoAutorizacao)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error processing payment'))
    }
  }

  async aprovarPagamento(id: string, propriedadeId: string, transactionId: string, codigoAutorizacao: string): Promise<Result<Pagamento, Error>> {
    try {
      const row = await this.prisma.comercialPagamento.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Payment not found or access denied'))

      const pResult = this.hydrate(row)
      if (pResult.isFail) return Result.fail(pResult.error)

      // Se o status atual for 'rascunho', primeiro transitamos para 'processando' conforme regras da entidade rica
      let currentPayment = pResult.value
      if (currentPayment.status === 'rascunho') {
        const procResult = currentPayment.processar(transactionId, codigoAutorizacao)
        if (procResult.isFail) return Result.fail(procResult.error)
        currentPayment = procResult.value
      }

      const transResult = currentPayment.aprovar(transactionId, codigoAutorizacao)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error approving payment'))
    }
  }

  async recusarPagamento(id: string, propriedadeId: string, mensagem: string): Promise<Result<Pagamento, Error>> {
    try {
      const row = await this.prisma.comercialPagamento.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Payment not found or access denied'))

      const pResult = this.hydrate(row)
      if (pResult.isFail) return Result.fail(pResult.error)

      // Se rascunho, processar antes
      let currentPayment = pResult.value
      if (currentPayment.status === 'rascunho') {
        const procResult = currentPayment.processar('dummy_tx', 'dummy_auth')
        if (procResult.isFail) return Result.fail(procResult.error)
        currentPayment = procResult.value
      }

      const transResult = currentPayment.recusar(mensagem)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error rejecting payment'))
    }
  }

  async estornarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>> {
    try {
      const row = await this.prisma.comercialPagamento.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Payment not found or access denied'))

      const pResult = this.hydrate(row)
      if (pResult.isFail) return Result.fail(pResult.error)

      const transResult = pResult.value.estornar(motivo)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error refunding payment'))
    }
  }

  async reembolsarPagamento(id: string, propriedadeId: string, motivo?: string): Promise<Result<Pagamento, Error>> {
    try {
      const row = await this.prisma.comercialPagamento.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Payment not found or access denied'))

      const pResult = this.hydrate(row)
      if (pResult.isFail) return Result.fail(pResult.error)

      const transResult = pResult.value.reembolsar(motivo)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error reimbursing payment'))
    }
  }
}
