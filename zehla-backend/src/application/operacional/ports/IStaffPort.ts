import { Result } from '../../../shared/Result'
import { Staff, CargoStaff, TurnoStaff } from '../../../domain/operacional/entities/Staff'

export interface IStaffPort {
  criarStaff(dados: {
    propriedadeId: string
    nome: string
    email?: string
    telefone?: string
    cargo: string
    turno: string
    habilidades?: string[]
    cargaHorariaSemanal?: number
  }): Promise<Result<Staff, Error>>

  buscarStaffPorId(id: string, propriedadeId: string): Promise<Result<Staff | null, Error>>

  listarStaffPorPropriedade(propriedadeId: string): Promise<Result<Staff[], Error>>

  listarDisponiveis(propriedadeId: string, turno?: string): Promise<Result<Staff[], Error>>

  listarPorHabilidade(habilidade: string, propriedadeId: string): Promise<Result<Staff[], Error>>

  listarPorCargo(cargo: string, propriedadeId: string): Promise<Result<Staff[], Error>>

  atualizarStaff(id: string, propriedadeId: string, dados: {
    ativo?: boolean
    email?: string
    telefone?: string
    turno?: string
    habilidades?: string[]
    tarefasEmAndamento?: number
  }): Promise<Result<Staff, Error>>
}
