import { PrismaClient } from '@prisma/client'
import { IChecklistPort } from '../../../application/operacional/ports/IChecklistPort'
import { Checklist, TipoTriggerChecklist, ItemChecklist } from '../../../domain/operacional/entities/Checklist'
import { Result } from '../../../shared/Result'

export class PrismaChecklistRepository implements IChecklistPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(c: Checklist): any {
    return {
      id: c.id,
      propriedadeId: c.propriedadeId,
      nome: c.nome,
      tipoTrigger: c.tipoTrigger,
      ativoId: c.ativoId ?? null,
      itens: JSON.stringify(c.itens),
      status: c.status,
      responsavelId: c.responsavelId ?? null,
      dataCriacao: c.dataCriacao,
      dataConclusao: c.dataConclusao ?? null,
    }
  }

  private hydrate(row: any): Result<Checklist, Error> {
    try {
      let itens: ItemChecklist[]
      try {
        itens = typeof row.itens === 'string' ? JSON.parse(row.itens) : row.itens
      } catch {
        return Result.fail(new Error('Itens do checklist corrompidos no banco'))
      }

      return Checklist.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        nome: row.nome,
        tipoTrigger: row.tipoTrigger,
        ativoId: row.ativoId ?? undefined,
        itens,
        status: row.status,
        responsavelId: row.responsavelId ?? undefined,
        dataCriacao: row.dataCriacao,
        dataConclusao: row.dataConclusao ?? undefined,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar checklist'))
    }
  }

  async criarChecklist(dados: {
    propriedadeId: string
    nome: string
    tipoTrigger: string
    ativoId?: string
    itens: ItemChecklist[]
    responsavelId?: string
  }): Promise<Result<Checklist, Error>> {
    try {
      const checklistResult = Checklist.create({
        id: `check_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        propriedadeId: dados.propriedadeId,
        nome: dados.nome,
        tipoTrigger: dados.tipoTrigger,
        ativoId: dados.ativoId,
        itens: dados.itens,
        responsavelId: dados.responsavelId,
        dataCriacao: new Date(),
      })
      if (checklistResult.isFail) return checklistResult

      const checklist = checklistResult.value
      await this.prisma.operacionalChecklist.create({ data: this.toData(checklist) })
      return Result.ok(checklist)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar checklist'))
    }
  }

  async buscarChecklistPorId(id: string, propriedadeId: string): Promise<Result<Checklist | null, Error>> {
    try {
      const row = await this.prisma.operacionalChecklist.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar checklist'))
    }
  }

  async listarPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Checklist[], Error>> {
    try {
      const rows = await this.prisma.operacionalChecklist.findMany({
        where: { ativoId, propriedadeId },
        orderBy: { dataCriacao: 'desc' },
      })
      const result: Checklist[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar checklists por ativo'))
    }
  }

  async listarPorTrigger(tipoTrigger: TipoTriggerChecklist, propriedadeId: string): Promise<Result<Checklist[], Error>> {
    try {
      const rows = await this.prisma.operacionalChecklist.findMany({
        where: { tipoTrigger, propriedadeId },
        orderBy: { dataCriacao: 'desc' },
      })
      const result: Checklist[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar checklists por trigger'))
    }
  }

  async listarPendentesPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Checklist[], Error>> {
    try {
      const rows = await this.prisma.operacionalChecklist.findMany({
        where: { ativoId, propriedadeId, status: { in: ['pendente', 'em_andamento'] } },
        orderBy: { dataCriacao: 'desc' },
      })
      const result: Checklist[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar checklists pendentes'))
    }
  }

  async atualizarChecklist(id: string, propriedadeId: string, dados: {
    status?: string
    itens?: ItemChecklist[]
    dataConclusao?: Date
  }): Promise<Result<Checklist, Error>> {
    try {
      const row = await this.prisma.operacionalChecklist.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.fail(new Error('Checklist não encontrado ou acesso negado'))

      const updateData: any = {}
      if (dados.itens) updateData.itens = JSON.stringify(dados.itens)
      if (dados.status) updateData.status = dados.status
      if (dados.dataConclusao) updateData.dataConclusao = dados.dataConclusao

      const updated = await this.prisma.operacionalChecklist.update({
        where: { id },
        data: updateData,
      })
      return this.hydrate(updated)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar checklist'))
    }
  }
}
