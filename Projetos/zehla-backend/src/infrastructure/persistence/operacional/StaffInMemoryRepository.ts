import { Result } from '../../../shared/Result'
import { IStaffPort } from '../../../application/operacional/ports/IStaffPort'
import { Staff } from '../../../domain/operacional/entities/Staff'

export class StaffInMemoryRepository implements IStaffPort {
  private staffList: Map<string, Staff> = new Map()

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
    const staffResult = Staff.create({
      id: `staff_${this.staffList.size + 1}_${Date.now()}`,
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
    this.staffList.set(staffResult.value.id, staffResult.value)
    return Result.ok(staffResult.value)
  }

  async buscarStaffPorId(id: string, propriedadeId: string): Promise<Result<Staff | null, Error>> {
    const staff = this.staffList.get(id)
    if (!staff || staff.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(staff)
  }

  async listarStaffPorPropriedade(propriedadeId: string): Promise<Result<Staff[], Error>> {
    const lista = Array.from(this.staffList.values()).filter(s => s.propriedadeId === propriedadeId)
    return Result.ok(lista)
  }

  async listarDisponiveis(propriedadeId: string, turno?: string): Promise<Result<Staff[], Error>> {
    let lista = Array.from(this.staffList.values()).filter(
      s => s.propriedadeId === propriedadeId && s.estaDisponivel,
    )
    if (turno) lista = lista.filter(s => s.turno === turno)
    return Result.ok(lista)
  }

  async listarPorHabilidade(habilidade: string, propriedadeId: string): Promise<Result<Staff[], Error>> {
    const lista = Array.from(this.staffList.values()).filter(
      s => s.propriedadeId === propriedadeId && s.temHabilidade(habilidade),
    )
    return Result.ok(lista)
  }

  async listarPorCargo(cargo: string, propriedadeId: string): Promise<Result<Staff[], Error>> {
    const lista = Array.from(this.staffList.values()).filter(
      s => s.propriedadeId === propriedadeId && s.cargo === cargo,
    )
    return Result.ok(lista)
  }

  async atualizarStaff(id: string, propriedadeId: string, dados: {
    ativo?: boolean
    email?: string
    telefone?: string
    turno?: string
    habilidades?: string[]
    tarefasEmAndamento?: number
  }): Promise<Result<Staff, Error>> {
    const staff = this.staffList.get(id)
    if (!staff || staff.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Staff não encontrado'))
    }

    const atualizadoResult = Staff.create({
      id: staff.id,
      propriedadeId: staff.propriedadeId,
      dataContratacao: staff.dataContratacao,
      nome: staff.nome,
      email: dados.email || staff.email,
      telefone: dados.telefone || staff.telefone,
      cargo: staff.cargo,
      turno: dados.turno || staff.turno,
      ativo: dados.ativo !== undefined ? dados.ativo : staff.ativo,
      habilidades: dados.habilidades || staff.habilidades,
      cargaHorariaSemanal: staff.cargaHorariaSemanal,
      tarefasEmAndamento: dados.tarefasEmAndamento !== undefined ? dados.tarefasEmAndamento : staff.tarefasEmAndamento,
    })
    if (atualizadoResult.isFail) return atualizadoResult
    this.staffList.set(id, atualizadoResult.value)
    return Result.ok(atualizadoResult.value)
  }
}
