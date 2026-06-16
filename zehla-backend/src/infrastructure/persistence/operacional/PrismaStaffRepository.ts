import { PrismaClient } from '@prisma/client'
import { IStaffPort } from '../../../application/operacional/ports/IStaffPort'
import { Staff, CargoStaff, TurnoStaff } from '../../../domain/operacional/entities/Staff'
import { Result } from '../../../shared/Result'

export class PrismaStaffRepository implements IStaffPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(staff: Staff): any {
    return {
      id: staff.id,
      propriedadeId: staff.propriedadeId,
      dataContratacao: staff.dataContratacao,
      nome: staff.nome,
      email: staff.email ?? null,
      telefone: staff.telefone ?? null,
      cargo: staff.cargo,
      turno: staff.turno,
      ativo: staff.ativo,
      habilidades: staff.habilidades,
      cargaHorariaSemanal: staff.cargaHorariaSemanal,
      tarefasEmAndamento: staff.tarefasEmAndamento,
    }
  }

  private hydrate(row: any): Result<Staff, Error> {
    try {
      return Staff.create({
        id: row.id,
        propriedadeId: row.propriedadeId,
        dataContratacao: row.dataContratacao,
        nome: row.nome,
        email: row.email ?? undefined,
        telefone: row.telefone ?? undefined,
        cargo: row.cargo,
        turno: row.turno,
        ativo: row.ativo,
        habilidades: row.habilidades ?? [],
        cargaHorariaSemanal: row.cargaHorariaSemanal,
        tarefasEmAndamento: row.tarefasEmAndamento,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar staff'))
    }
  }

  async criarStaff(dados: {
    propriedadeId: string
    nome: string
    email?: string
    telefone?: string
    cargo: string
    turno: string
    habilidades?: string[]
    cargaHorariaSemanal?: number
  }): Promise<Result<Staff, Error>> {
    try {
      const staffResult = Staff.create({
        id: `staff_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        propriedadeId: dados.propriedadeId,
        dataContratacao: new Date(),
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        cargo: dados.cargo,
        turno: dados.turno,
        habilidades: dados.habilidades,
        cargaHorariaSemanal: dados.cargaHorariaSemanal,
      })
      if (staffResult.isFail) return staffResult

      const staff = staffResult.value
      await this.prisma.operacionalStaff.create({ data: this.toData(staff) })
      return Result.ok(staff)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar staff'))
    }
  }

  async buscarStaffPorId(id: string, propriedadeId: string): Promise<Result<Staff | null, Error>> {
    try {
      const row = await this.prisma.operacionalStaff.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar staff'))
    }
  }

  async listarStaffPorPropriedade(propriedadeId: string): Promise<Result<Staff[], Error>> {
    try {
      const rows = await this.prisma.operacionalStaff.findMany({
        where: { propriedadeId },
        orderBy: { nome: 'asc' },
      })
      const result: Staff[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar staff'))
    }
  }

  async listarDisponiveis(propriedadeId: string, turno?: string): Promise<Result<Staff[], Error>> {
    try {
      const where: any = { propriedadeId, ativo: true, tarefasEmAndamento: { lt: 3 } }
      if (turno) where.turno = turno
      const rows = await this.prisma.operacionalStaff.findMany({ where, orderBy: { nome: 'asc' } })
      const result: Staff[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar staff disponível'))
    }
  }

  async listarPorHabilidade(habilidade: string, propriedadeId: string): Promise<Result<Staff[], Error>> {
    try {
      const rows = await this.prisma.operacionalStaff.findMany({
        where: { propriedadeId, habilidades: { has: habilidade } },
        orderBy: { nome: 'asc' },
      })
      const result: Staff[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar staff por habilidade'))
    }
  }

  async listarPorCargo(cargo: string, propriedadeId: string): Promise<Result<Staff[], Error>> {
    try {
      const rows = await this.prisma.operacionalStaff.findMany({
        where: { propriedadeId, cargo },
        orderBy: { nome: 'asc' },
      })
      const result: Staff[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar staff por cargo'))
    }
  }

  async atualizarStaff(id: string, propriedadeId: string, dados: {
    ativo?: boolean
    email?: string
    telefone?: string
    turno?: string
    habilidades?: string[]
    tarefasEmAndamento?: number
  }): Promise<Result<Staff, Error>> {
    try {
      const row = await this.prisma.operacionalStaff.findFirst({
        where: { id, propriedadeId },
      })
      if (!row) return Result.fail(new Error('Staff não encontrado ou acesso negado'))

      const data: any = {}
      if (dados.ativo !== undefined) data.ativo = dados.ativo
      if (dados.email !== undefined) data.email = dados.email
      if (dados.telefone !== undefined) data.telefone = dados.telefone
      if (dados.turno !== undefined) data.turno = dados.turno
      if (dados.habilidades !== undefined) data.habilidades = dados.habilidades
      if (dados.tarefasEmAndamento !== undefined) data.tarefasEmAndamento = dados.tarefasEmAndamento

      const updated = await this.prisma.operacionalStaff.update({
        where: { id },
        data,
      })
      return this.hydrate(updated)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar staff'))
    }
  }
}
