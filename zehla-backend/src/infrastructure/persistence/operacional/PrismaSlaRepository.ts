import { PrismaClient } from '@prisma/client'
import { ISlaPort } from '../../../application/operacional/ports/ISlaPort'
import { SLA } from '../../../domain/operacional/entities/SLA'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'
import { TipoTarefa } from '../../../domain/operacional/entities/Tarefa'
import { Result } from '../../../shared/Result'

export class PrismaSlaRepository implements ISlaPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(sla: SLA): any {
    return {
      id: sla.id,
      tipoTarefa: sla.tipoTarefa,
      prioridade: sla.prioridade.value,
      prazoHoras: sla.prazoHoras,
      prazoMinutos: sla.prazoMinutos ?? null,
      regraEscalacao: sla.regraEscalacao ?? null,
      notificarEm: sla.notificarEm,
      ativo: sla.ativo,
    }
  }

  private hydrate(row: any): Result<SLA, Error> {
    try {
      const prioridadeResult = Prioridade.criar(row.prioridade)
      if (prioridadeResult.isFail) return Result.fail(prioridadeResult.error)

      return SLA.create({
        id: row.id,
        tipoTarefa: row.tipoTarefa,
        prioridade: prioridadeResult.value,
        prazoHoras: row.prazoHoras,
        prazoMinutos: row.prazoMinutos ?? undefined,
        regraEscalacao: row.regraEscalacao ?? undefined,
        notificarEm: row.notificarEm,
        ativo: row.ativo,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar SLA'))
    }
  }

  async criarSla(dados: {
    tipoTarefa: string
    prioridade: Prioridade
    prazoHoras?: number
    prazoMinutos?: number
    regraEscalacao?: string
    notificarEm?: number
  }): Promise<Result<SLA, Error>> {
    try {
      const slaResult = SLA.create({
        id: `sla_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        tipoTarefa: dados.tipoTarefa,
        prioridade: dados.prioridade,
        prazoHoras: dados.prazoHoras,
        prazoMinutos: dados.prazoMinutos,
        regraEscalacao: dados.regraEscalacao,
        notificarEm: dados.notificarEm,
      })
      if (slaResult.isFail) return slaResult

      const sla = slaResult.value
      await this.prisma.operacionalSla.create({ data: this.toData(sla) })
      return Result.ok(sla)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar SLA'))
    }
  }

  async buscarSlaPorId(id: string): Promise<Result<SLA | null, Error>> {
    try {
      const row = await this.prisma.operacionalSla.findUnique({ where: { id } })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar SLA'))
    }
  }

  async buscarSla(tipoTarefa: TipoTarefa, prioridade: Prioridade): Promise<Result<SLA | null, Error>> {
    try {
      const row = await this.prisma.operacionalSla.findUnique({
        where: { tipoTarefa_prioridade: { tipoTarefa, prioridade: prioridade.value } },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar SLA'))
    }
  }

  async listarAtivos(): Promise<Result<SLA[], Error>> {
    try {
      const rows = await this.prisma.operacionalSla.findMany({
        where: { ativo: true },
        orderBy: [{ tipoTarefa: 'asc' }, { prioridade: 'asc' }],
      })
      const result: SLA[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar SLAs ativos'))
    }
  }

  async atualizarSla(id: string, dados: {
    prazoHoras?: number
    prazoMinutos?: number
    ativo?: boolean
    notificarEm?: number
  }): Promise<Result<SLA, Error>> {
    try {
      const row = await this.prisma.operacionalSla.findUnique({ where: { id } })
      if (!row) return Result.fail(new Error('SLA não encontrado'))

      const updateData: any = {}
      if (dados.prazoHoras !== undefined) updateData.prazoHoras = dados.prazoHoras
      if (dados.prazoMinutos !== undefined) updateData.prazoMinutos = dados.prazoMinutos
      if (dados.ativo !== undefined) updateData.ativo = dados.ativo
      if (dados.notificarEm !== undefined) updateData.notificarEm = dados.notificarEm

      const updated = await this.prisma.operacionalSla.update({
        where: { id },
        data: updateData,
      })
      return this.hydrate(updated)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar SLA'))
    }
  }
}
