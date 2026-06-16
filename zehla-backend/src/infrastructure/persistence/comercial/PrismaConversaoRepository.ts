import { PrismaClient } from '@prisma/client'
import { IConversaoPort } from '../../../application/comercial/ports/IConversaoPort'
import { Conversao } from '../../../domain/comercial/entities/Conversao'
import { Result } from '../../../shared/Result'

export class PrismaConversaoRepository implements IConversaoPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(conversao: Conversao): any {
    return {
      id: conversao.id,
      leadId: conversao.leadId,
      propostaId: conversao.propostaId,
      propriedadeId: conversao.propriedadeId,
      pagamentoId: conversao.pagamentoId,
      dataConversao: conversao.dataConversao || null,
      dataConfirmacao: conversao.dataConfirmacao || null,
      status: conversao.status,
      motivoCancelamento: conversao.motivoCancelamento || null,
      observacoes: conversao.observacoes || null
    }
  }

  private hydrate(row: any): Result<Conversao, Error> {
    try {
      const props = {
        id: row.id,
        leadId: row.leadId,
        propostaId: row.propostaId,
        propriedadeId: row.propriedadeId,
        pagamentoId: row.pagamentoId,
        dataConversao: row.dataConversao || undefined,
        dataConfirmacao: row.dataConfirmacao || undefined,
        status: row.status as any,
        motivoCancelamento: row.motivoCancelamento || undefined,
        observacoes: row.observacoes || undefined
      }

      return Conversao.create(props)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error hydrating ComercialConversao'))
    }
  }

  async criarConversao(dados: {
    leadId: string
    propostaId: string
    propriedadeId: string
    pagamentoId: string
  }): Promise<Result<Conversao, Error>> {
    try {
      const id = `conversao_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const props = {
        id,
        leadId: dados.leadId,
        propostaId: dados.propostaId,
        propriedadeId: dados.propriedadeId, // RLS
        pagamentoId: dados.pagamentoId,
        dataConversao: new Date(),
        dataConfirmacao: undefined,
        status: 'pendente' as const,
        motivoCancelamento: undefined,
        observacoes: undefined
      }

      const conversaoResult = Conversao.create(props)
      if (conversaoResult.isFail) return Result.fail(conversaoResult.error)

      const conversao = conversaoResult.value
      const data = this.toData(conversao)

      await this.prisma.comercialConversao.create({ data })

      return Result.ok(conversao)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating conversion'))
    }
  }

  async buscarConversaoPorId(id: string, propriedadeId: string): Promise<Result<Conversao | null, Error>> {
    try {
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialConversao.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const conversaoResult = this.hydrate(row)
      if (conversaoResult.isFail) return Result.fail(conversaoResult.error)

      return Result.ok(conversaoResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding conversion by ID'))
    }
  }

  async listarConversoesPorLead(leadId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialConversao.findMany({
        where: {
          leadId,
          propriedadeId
        }
      })

      const conversoes: Conversao[] = []
      for (const row of rows) {
        const cResult = this.hydrate(row)
        if (cResult.isFail) return Result.fail(cResult.error)
        conversoes.push(cResult.value)
      }

      return Result.ok(conversoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by lead'))
    }
  }

  async listarConversoesPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialConversao.findMany({
        where: {
          propostaId,
          propriedadeId
        }
      })

      const conversoes: Conversao[] = []
      for (const row of rows) {
        const cResult = this.hydrate(row)
        if (cResult.isFail) return Result.fail(cResult.error)
        conversoes.push(cResult.value)
      }

      return Result.ok(conversoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by proposal'))
    }
  }

  async listarConversoesPorPagamento(pagamentoId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialConversao.findMany({
        where: {
          pagamentoId,
          propriedadeId
        }
      })

      const conversoes: Conversao[] = []
      for (const row of rows) {
        const cResult = this.hydrate(row)
        if (cResult.isFail) return Result.fail(cResult.error)
        conversoes.push(cResult.value)
      }

      return Result.ok(conversoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by payment'))
    }
  }

  async listarConversoesPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Conversao[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialConversao.findMany({
        where: {
          propriedadeId,
          status: { in: status }
        },
        take: limite
      })

      const conversoes: Conversao[] = []
      for (const row of rows) {
        const cResult = this.hydrate(row)
        if (cResult.isFail) return Result.fail(cResult.error)
        conversoes.push(cResult.value)
      }

      return Result.ok(conversoes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing conversions by status'))
    }
  }

  async atualizarComData(id: string, propriedadeId: string, c: Conversao): Promise<Result<Conversao, Error>> {
    try {
      const data = this.toData(c)
      await this.prisma.comercialConversao.update({
        where: { id, propriedadeId },
        data
      })
      const row = await this.prisma.comercialConversao.findUnique({ where: { id } })
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating conversion state'))
    }
  }

  async confirmarConversao(id: string, propriedadeId: string): Promise<Result<Conversao, Error>> {
    try {
      const row = await this.prisma.comercialConversao.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Conversion not found or access denied'))

      const cResult = this.hydrate(row)
      if (cResult.isFail) return Result.fail(cResult.error)

      const transResult = cResult.value.confirmar(new Date())
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error confirming conversion'))
    }
  }

  async cancelarConversao(id: string, propriedadeId: string, motivo: string): Promise<Result<Conversao, Error>> {
    try {
      const row = await this.prisma.comercialConversao.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Conversion not found or access denied'))

      const cResult = this.hydrate(row)
      if (cResult.isFail) return Result.fail(cResult.error)

      const transResult = cResult.value.cancelar(motivo)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error cancelling conversion'))
    }
  }

  async invalidarConversao(id: string, propriedadeId: string, motivo?: string): Promise<Result<Conversao, Error>> {
    try {
      const row = await this.prisma.comercialConversao.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Conversion not found or access denied'))

      const cResult = this.hydrate(row)
      if (cResult.isFail) return Result.fail(cResult.error)

      const transResult = cResult.value.invalidar(motivo)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error invalidating conversion'))
    }
  }

  async atualizarDataConversao(id: string, propriedadeId: string, data: Date): Promise<Result<Conversao, Error>> {
    try {
      const row = await this.prisma.comercialConversao.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Conversion not found or access denied'))

      const cResult = this.hydrate(row)
      if (cResult.isFail) return Result.fail(cResult.error)

      const transResult = cResult.value.atualizarDataConversao(data)
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarComData(id, propriedadeId, transResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating conversion date'))
    }
  }
}
