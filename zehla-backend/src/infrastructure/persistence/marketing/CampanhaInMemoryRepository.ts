import { Result } from '../../../shared/Result'
import { Campanha, StatusCampanha } from '../../../domain/marketing/entities/Campanha'
import { ICampanhaPort } from '../../../application/marketing/ports/ICampanhaPort'

export class CampanhaInMemoryRepository implements ICampanhaPort {
  private campanhas: Map<string, Campanha> = new Map()

  async criarCampanha(dados: {
    propriedadeId: string; nome: string; publicoAlvo: string; tipo: string
    conteudo?: string; dataInicio: Date; dataFim: Date
    possuiPromiseFinanceira?: boolean; promiseFinanceiraValidada?: boolean
  }): Promise<Result<Campanha, Error>> {
    const campanhaResult = Campanha.create({
      id: `cmp_${this.campanhas.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      nome: dados.nome,
      publicoAlvo: dados.publicoAlvo,
      tipo: dados.tipo,
      conteudo: dados.conteudo,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      possuiPromiseFinanceira: dados.possuiPromiseFinanceira,
      promiseFinanceiraValidada: dados.promiseFinanceiraValidada,
    })
    if (campanhaResult.isFail) return campanhaResult
    this.campanhas.set(campanhaResult.value.id, campanhaResult.value)
    return Result.ok(campanhaResult.value)
  }

  async buscarPorId(id: string, propriedadeId: string): Promise<Result<Campanha | null, Error>> {
    const campanha = this.campanhas.get(id)
    if (!campanha || campanha.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(campanha)
  }

  async listarAtivas(propriedadeId: string): Promise<Result<Campanha[], Error>> {
    const ativas = Array.from(this.campanhas.values()).filter(
      c => c.propriedadeId === propriedadeId && !['concluida', 'cancelada'].includes(c.status),
    )
    return Result.ok(ativas)
  }

  async atualizarStatus(id: string, propriedadeId: string, status: StatusCampanha): Promise<Result<Campanha, Error>> {
    const campanha = this.campanhas.get(id)
    if (!campanha || campanha.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Campanha não encontrada'))
    }
    const novaCampanhaResult = Campanha.create({
      id: campanha.id, propriedadeId: campanha.propriedadeId,
      nome: campanha.nome, publicoAlvo: campanha.publicoAlvo,
      tipo: campanha.tipo, conteudo: campanha.conteudo,
      dataInicio: campanha.dataInicio, dataFim: campanha.dataFim,
      status, dataCriacao: campanha.dataCriacao,
      possuiPromiseFinanceira: campanha.possuiPromiseFinanceira,
      promiseFinanceiraValidada: campanha.promiseFinanceiraValidada,
    })
    if (novaCampanhaResult.isFail) return novaCampanhaResult
    this.campanhas.set(id, novaCampanhaResult.value)
    return Result.ok(novaCampanhaResult.value)
  }

  async cancelarCampanha(id: string, propriedadeId: string): Promise<Result<Campanha, Error>> {
    return this.atualizarStatus(id, propriedadeId, 'cancelada')
  }

  async listarPorPeriodo(propriedadeId: string, dataInicio: Date, dataFim: Date): Promise<Result<Campanha[], Error>> {
    const lista = Array.from(this.campanhas.values()).filter(
      c => c.propriedadeId === propriedadeId && c.dataCriacao >= dataInicio && c.dataCriacao <= dataFim,
    )
    return Result.ok(lista)
  }
}
