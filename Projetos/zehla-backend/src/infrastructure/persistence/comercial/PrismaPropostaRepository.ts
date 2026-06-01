import { PrismaClient } from '@prisma/client'
import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'

export class PrismaPropostaRepository implements IPropostaPort {
  constructor(private readonly prisma: PrismaClient) {}

  private toData(proposta: Proposta): any {
    return {
      id: proposta.id,
      leadId: proposta.leadId,
      propriedadeId: proposta.propriedadeId,
      pacoteId: proposta.pacoteId,
      dataCriacao: proposta.dataCriacao,
      dataCheckIn: proposta.dataCheckIn || null,
      dataCheckOut: proposta.dataCheckOut || null,
      quantidadeHospedes: proposta.quantidadeHospedes || null,
      valorTotal: proposta.valorTotal?.centavos || null,
      valorSinal: proposta.valorSinal?.centavos || null,
      descontoAplicado: proposta.descontoAplicado?.centavos || null,
      status: proposta.status,
      validade: proposta.validade || null,
      observacoes: proposta.observacoes || null,
      historicoVersoes: proposta.historicoVersoes ? JSON.stringify(proposta.historicoVersoes) : null
    }
  }

  private hydrate(row: any): Result<Proposta, Error> {
    try {
      let valorTotal: Money | undefined
      if (row.valorTotal !== null && row.valorTotal !== undefined) {
        const vResult = Money.criar(row.valorTotal)
        if (vResult.isFail) return Result.fail(vResult.error)
        valorTotal = vResult.value
      }

      let valorSinal: Money | undefined
      if (row.valorSinal !== null && row.valorSinal !== undefined) {
        const vResult = Money.criar(row.valorSinal)
        if (vResult.isFail) return Result.fail(vResult.error)
        valorSinal = vResult.value
      }

      let descontoAplicado: Money | undefined
      if (row.descontoAplicado !== null && row.descontoAplicado !== undefined) {
        const vResult = Money.criar(row.descontoAplicado)
        if (vResult.isFail) return Result.fail(vResult.error)
        descontoAplicado = vResult.value
      }

      let historicoVersoes: any[] | undefined
      if (row.historicoVersoes) {
        try {
          historicoVersoes = JSON.parse(row.historicoVersoes)
        } catch {
          historicoVersoes = undefined
        }
      }

      const propostaProps = {
        id: row.id,
        leadId: row.leadId,
        propriedadeId: row.propriedadeId,
        pacoteId: row.pacoteId,
        dataCriacao: row.dataCriacao,
        dataCheckIn: row.dataCheckIn || undefined,
        dataCheckOut: row.dataCheckOut || undefined,
        quantidadeHospedes: row.quantidadeHospedes !== null ? row.quantidadeHospedes : undefined,
        valorTotal,
        valorSinal,
        descontoAplicado,
        status: row.status as any,
        validade: row.validade || undefined,
        observacoes: row.observacoes || undefined,
        historicoVersoes
      }

      return Proposta.create(propostaProps)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error hydrating ComercialProposta'))
    }
  }

  async criarProposta(dados: {
    leadId: string
    propriedadeId: string
    pacoteId: string
    dataCheckIn: Date
    dataCheckOut: Date
    quantidadeHospedes: number
    observacoes?: string
  }): Promise<Result<Proposta, Error>> {
    try {
      const id = `proposta_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const props = {
        id,
        leadId: dados.leadId,
        propriedadeId: dados.propriedadeId, // RLS
        pacoteId: dados.pacoteId,
        dataCriacao: new Date(),
        dataCheckIn: dados.dataCheckIn,
        dataCheckOut: dados.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes,
        valorTotal: undefined, // Calculado posteriormente
        valorSinal: undefined,
        descontoAplicado: undefined,
        status: 'rascunho' as const,
        validade: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Padrão: 3 dias de validade
        observacoes: dados.observacoes,
        historicoVersoes: undefined
      }

      const propostaResult = Proposta.create(props)
      if (propostaResult.isFail) return Result.fail(propostaResult.error)

      const proposta = propostaResult.value
      const data = this.toData(proposta)

      await this.prisma.comercialProposta.create({ data })

      return Result.ok(proposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating proposal'))
    }
  }

  async buscarPropostaPorId(id: string, propriedadeId: string): Promise<Result<Proposta | null, Error>> {
    try {
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialProposta.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const propostaResult = this.hydrate(row)
      if (propostaResult.isFail) return Result.fail(propostaResult.error)

      return Result.ok(propostaResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding proposal by ID'))
    }
  }

  async listarPropostasPorLead(leadId: string, propriedadeId: string): Promise<Result<Proposta[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialProposta.findMany({
        where: {
          leadId,
          propriedadeId
        }
      })

      const propostas: Proposta[] = []
      for (const row of rows) {
        const pResult = this.hydrate(row)
        if (pResult.isFail) return Result.fail(pResult.error)
        propostas.push(pResult.value)
      }

      return Result.ok(propostas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing proposals by lead'))
    }
  }

  async listarPropostasPorPacote(pacoteId: string, propriedadeId: string): Promise<Result<Proposta[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialProposta.findMany({
        where: {
          pacoteId,
          propriedadeId
        }
      })

      const propostas: Proposta[] = []
      for (const row of rows) {
        const pResult = this.hydrate(row)
        if (pResult.isFail) return Result.fail(pResult.error)
        propostas.push(pResult.value)
      }

      return Result.ok(propostas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing proposals by package'))
    }
  }

  async listarPropostasPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Proposta[], Error>> {
    try {
      // RLS - propriedadeId
      const rows = await this.prisma.comercialProposta.findMany({
        where: {
          propriedadeId,
          status: { in: status }
        },
        take: limite
      })

      const propostas: Proposta[] = []
      for (const row of rows) {
        const pResult = this.hydrate(row)
        if (pResult.isFail) return Result.fail(pResult.error)
        propostas.push(pResult.value)
      }

      return Result.ok(propostas)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing proposals by status'))
    }
  }

  async atualizarProposta(
    id: string,
    propriedadeId: string,
    dados: {
      dataCheckIn?: Date
      dataCheckOut?: Date
      quantidadeHospedes?: number
      observacoes?: string
    }
  ): Promise<Result<Proposta, Error>> {
    try {
      // RLS
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })

      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      const proposta = currentPropostaResult.value

      const updatedProps = {
        id: proposta.id,
        leadId: proposta.leadId,
        propriedadeId: proposta.propriedadeId,
        pacoteId: proposta.pacoteId,
        dataCriacao: proposta.dataCriacao,
        dataCheckIn: dados.dataCheckIn !== undefined ? dados.dataCheckIn : proposta.dataCheckIn,
        dataCheckOut: dados.dataCheckOut !== undefined ? dados.dataCheckOut : proposta.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes !== undefined ? dados.quantidadeHospedes : proposta.quantidadeHospedes,
        valorTotal: proposta.valorTotal,
        valorSinal: proposta.valorSinal,
        descontoAplicado: proposta.descontoAplicado,
        status: proposta.status,
        validade: proposta.validade,
        observacoes: dados.observacoes !== undefined ? dados.observacoes : proposta.observacoes,
        historicoVersoes: proposta.historicoVersoes
      }

      const updatedResult = Proposta.create(updatedProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedProposta = updatedResult.value
      const data = this.toData(updatedProposta)

      await this.prisma.comercialProposta.update({
        where: { id },
        data
      })

      return Result.ok(updatedProposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal'))
    }
  }

  async atualizarValorProposta(id: string, propriedadeId: string, valorTotal: Money): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      const proposta = currentPropostaResult.value

      const updatedProps = {
        id: proposta.id,
        leadId: proposta.leadId,
        propriedadeId: proposta.propriedadeId,
        pacoteId: proposta.pacoteId,
        dataCriacao: proposta.dataCriacao,
        dataCheckIn: proposta.dataCheckIn,
        dataCheckOut: proposta.dataCheckOut,
        quantidadeHospedes: proposta.quantidadeHospedes,
        valorTotal: valorTotal,
        valorSinal: proposta.valorSinal,
        descontoAplicado: proposta.descontoAplicado,
        status: proposta.status,
        validade: proposta.validade,
        observacoes: proposta.observacoes,
        historicoVersoes: proposta.historicoVersoes
      }

      const updatedResult = Proposta.create(updatedProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedProposta = updatedResult.value
      const data = this.toData(updatedProposta)

      await this.prisma.comercialProposta.update({
        where: { id },
        data
      })

      return Result.ok(updatedProposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal total value'))
    }
  }

  async atualizarSinalProposta(id: string, propriedadeId: string, valorSinal: Money): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      const proposta = currentPropostaResult.value

      const updatedProps = {
        id: proposta.id,
        leadId: proposta.leadId,
        propriedadeId: proposta.propriedadeId,
        pacoteId: proposta.pacoteId,
        dataCriacao: proposta.dataCriacao,
        dataCheckIn: proposta.dataCheckIn,
        dataCheckOut: proposta.dataCheckOut,
        quantidadeHospedes: proposta.quantidadeHospedes,
        valorTotal: proposta.valorTotal,
        valorSinal: valorSinal,
        descontoAplicado: proposta.descontoAplicado,
        status: proposta.status,
        validade: proposta.validade,
        observacoes: proposta.observacoes,
        historicoVersoes: proposta.historicoVersoes
      }

      const updatedResult = Proposta.create(updatedProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedProposta = updatedResult.value
      const data = this.toData(updatedProposta)

      await this.prisma.comercialProposta.update({
        where: { id },
        data
      })

      return Result.ok(updatedProposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal deposit value'))
    }
  }

  async atualizarDescontoProposta(id: string, propriedadeId: string, desconto: Money): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      const proposta = currentPropostaResult.value

      // Usar a lógica interna de negócio rica da Proposta
      const discountResult = proposta.aplicarDesconto(desconto)
      if (discountResult.isFail) return Result.fail(discountResult.error)

      const updatedProposta = discountResult.value
      const data = this.toData(updatedProposta)

      await this.prisma.comercialProposta.update({
        where: { id },
        data
      })

      return Result.ok(updatedProposta)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error applying discount to proposal'))
    }
  }

  async atualizarStatus(id: string, propriedadeId: string, status: any): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      await this.prisma.comercialProposta.update({
        where: { id },
        data: { status }
      })

      const updatedRow = await this.prisma.comercialProposta.findUnique({ where: { id } })
      return this.hydrate(updatedRow)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating proposal status'))
    }
  }

  async enviarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.enviar()
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarStatus(id, propriedadeId, 'enviada')
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error sending proposal'))
    }
  }

  async visualizarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.visualizar()
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarStatus(id, propriedadeId, 'vista')
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error viewing proposal'))
    }
  }

  async negociarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.negociar()
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarStatus(id, propriedadeId, 'negociacao')
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error negotiating proposal'))
    }
  }

  async aceitarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.aceitar()
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarStatus(id, propriedadeId, 'aceita')
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error accepting proposal'))
    }
  }

  async recusarProposta(id: string, propriedadeId: string, motivo?: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.recusar(motivo)
      if (transResult.isFail) return Result.fail(transResult.error)

      const obs = motivo ? `Motivo recusa: ${motivo}` : undefined

      await this.prisma.comercialProposta.update({
        where: { id },
        data: {
          status: 'recusada',
          observacoes: obs ? (row.observacoes ? `${row.observacoes} [${obs}]` : obs) : row.observacoes
        }
      })

      const updatedRow = await this.prisma.comercialProposta.findUnique({ where: { id } })
      return this.hydrate(updatedRow)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error rejecting proposal'))
    }
  }

  async expirarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.expirar()
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarStatus(id, propriedadeId, 'expirada')
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error expiring proposal'))
    }
  }

  async converterProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    try {
      const row = await this.prisma.comercialProposta.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Proposal not found or access denied'))

      const currentPropostaResult = this.hydrate(row)
      if (currentPropostaResult.isFail) return Result.fail(currentPropostaResult.error)
      
      const transResult = currentPropostaResult.value.converter()
      if (transResult.isFail) return Result.fail(transResult.error)

      return this.atualizarStatus(id, propriedadeId, 'convertida')
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error converting proposal'))
    }
  }
}
