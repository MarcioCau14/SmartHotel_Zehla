import { Result } from '../../../shared/Result'
import { SLA } from '../../../domain/operacional/entities/SLA'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'
import { TipoTarefa } from '../../../domain/operacional/entities/Tarefa'

export interface ISlaPort {
  criarSla(dados: {
    tipoTarefa: string
    prioridade: Prioridade
    prazoHoras?: number
    prazoMinutos?: number
    regraEscalacao?: string
    notificarEm?: number
  }): Promise<Result<SLA, Error>>

  buscarSlaPorId(id: string): Promise<Result<SLA | null, Error>>

  buscarSla(tipoTarefa: TipoTarefa, prioridade: Prioridade): Promise<Result<SLA | null, Error>>

  listarAtivos(): Promise<Result<SLA[], Error>>

  atualizarSla(id: string, dados: {
    prazoHoras?: number
    prazoMinutos?: number
    ativo?: boolean
    notificarEm?: number
  }): Promise<Result<SLA, Error>>
}
