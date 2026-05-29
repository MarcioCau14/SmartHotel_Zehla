import { Result } from '../../../shared/Result'
import { ISlaPort } from '../../../application/operacional/ports/ISlaPort'
import { SLA } from '../../../domain/operacional/entities/SLA'
import { Prioridade } from '../../../domain/operacional/value-objects/Prioridade'
import { TipoTarefa } from '../../../domain/operacional/entities/Tarefa'

export class SlaInMemoryRepository implements ISlaPort {
  private slas: Map<string, SLA> = new Map()

  async criarSla(dados: {
    tipoTarefa: string
    prioridade: Prioridade
    prazoHoras?: number
    prazoMinutos?: number
    regraEscalacao?: string
    notificarEm?: number
  }): Promise<Result<SLA, Error>> {
    const slaResult = SLA.create({
      id: `sla_${this.slas.size + 1}_${Date.now()}`,
      tipoTarefa: dados.tipoTarefa,
      prioridade: dados.prioridade,
      prazoHoras: dados.prazoHoras,
      prazoMinutos: dados.prazoMinutos,
      regraEscalacao: dados.regraEscalacao,
      notificarEm: dados.notificarEm,
    })
    if (slaResult.isFail) return slaResult
    this.slas.set(slaResult.value.id, slaResult.value)
    return Result.ok(slaResult.value)
  }

  async buscarSlaPorId(id: string): Promise<Result<SLA | null, Error>> {
    const sla = this.slas.get(id)
    if (!sla) return Result.ok(null)
    return Result.ok(sla)
  }

  async buscarSla(tipoTarefa: TipoTarefa, prioridade: Prioridade): Promise<Result<SLA | null, Error>> {
    const sla = Array.from(this.slas.values()).find(
      s => s.tipoTarefa === tipoTarefa && s.prioridade.equals(prioridade) && s.ativo,
    )
    if (!sla) return Result.ok(null)
    return Result.ok(sla)
  }

  async listarAtivos(): Promise<Result<SLA[], Error>> {
    const lista = Array.from(this.slas.values()).filter(s => s.ativo)
    return Result.ok(lista)
  }

  async atualizarSla(id: string, dados: {
    prazoHoras?: number
    prazoMinutos?: number
    ativo?: boolean
    notificarEm?: number
  }): Promise<Result<SLA, Error>> {
    const sla = this.slas.get(id)
    if (!sla) return Result.fail(new Error('SLA não encontrado'))

    const atualizadoResult = SLA.create({
      id: sla.id,
      tipoTarefa: sla.tipoTarefa,
      prioridade: sla.prioridade,
      prazoHoras: dados.prazoHoras || sla.prazoHoras,
      prazoMinutos: dados.prazoMinutos !== undefined ? dados.prazoMinutos : sla.prazoMinutos,
      regraEscalacao: sla.regraEscalacao,
      notificarEm: dados.notificarEm || sla.notificarEm,
      ativo: dados.ativo !== undefined ? dados.ativo : sla.ativo,
    })
    if (atualizadoResult.isFail) return atualizadoResult
    this.slas.set(id, atualizadoResult.value)
    return Result.ok(atualizadoResult.value)
  }
}
