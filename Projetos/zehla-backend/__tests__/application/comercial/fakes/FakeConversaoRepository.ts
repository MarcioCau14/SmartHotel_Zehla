import { IConversaoPort } from '../../../../src/application/comercial/ports/IConversaoPort'
import { Conversao, ConversaoStatus } from '../../../../src/domain/comercial/entities/Conversao'
import { Result } from '../../../../src/shared/Result'

export class FakeConversaoRepository implements IConversaoPort {
  public conversoes: Conversao[] = []

  async criarConversao(dados: {
    leadId: string
    propostaId: string
    propriedadeId: string
    pagamentoId: string
  }): Promise<Result<Conversao, Error>> {
    try {
      const id = `conversao_${Math.random().toString(36).substr(2, 9)}`

      const conversaoResult = Conversao.create({
        id,
        leadId: dados.leadId,
        propostaId: dados.propostaId,
        propriedadeId: dados.propriedadeId,
        pagamentoId: dados.pagamentoId,
        dataConversao: new Date(),
        status: 'pendente'
      })

      if (conversaoResult.isFail) return Result.fail(conversaoResult.error)

      this.conversoes.push(conversaoResult.value)
      return Result.ok(conversaoResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error creating conversion in fake repo'))
    }
  }

  async buscarConversaoPorId(id: string, propriedadeId: string): Promise<Result<Conversao | null, Error>> {
    const conversao = this.conversoes.find(c => c.id === id && c.propriedadeId === propriedadeId)
    return Result.ok(conversao || null)
  }

  async listarConversoesPorLead(leadId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    const list = this.conversoes.filter(c => c.leadId === leadId && c.propriedadeId === propriedadeId)
    return Result.ok(list)
  }

  async listarConversoesPorProposta(propostaId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    const list = this.conversoes.filter(c => c.propostaId === propostaId && c.propriedadeId === propriedadeId)
    return Result.ok(list)
  }

  async listarConversoesPorPagamento(pagamentoId: string, propriedadeId: string): Promise<Result<Conversao[], Error>> {
    const list = this.conversoes.filter(c => c.pagamentoId === pagamentoId && c.propriedadeId === propriedadeId)
    return Result.ok(list)
  }

  async listarConversoesPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Conversao[], Error>> {
    let result = this.conversoes.filter(c => c.propriedadeId === propriedadeId && status.includes(c.status))
    if (limite !== undefined) {
      result = result.slice(0, limite)
    }
    return Result.ok(result)
  }

  private async transitarStatus(id: string, propriedadeId: string, status: ConversaoStatus, extras: { motivo?: string; dataConfirmacao?: Date } = {}): Promise<Result<Conversao, Error>> {
    const index = this.conversoes.findIndex(c => c.id === id && c.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Conversion not found'))
    const current = this.conversoes[index]

    const result = Conversao.create({
      id: current.id,
      leadId: current.leadId,
      propostaId: current.propostaId,
      propriedadeId: current.propriedadeId,
      pagamentoId: current.pagamentoId,
      dataConversao: current.dataConversao,
      dataConfirmacao: extras.dataConfirmacao !== undefined ? extras.dataConfirmacao : current.dataConfirmacao,
      status,
      motivoCancelamento: extras.motivo !== undefined ? extras.motivo : current.motivoCancelamento,
      observacoes: current.observacoes
    })

    if (result.isFail) return Result.fail(result.error)
    this.conversoes[index] = result.value
    return Result.ok(result.value)
  }

  async confirmarConversao(id: string, propriedadeId: string): Promise<Result<Conversao, Error>> {
    return this.transitarStatus(id, propriedadeId, 'confirmada', { dataConfirmacao: new Date() })
  }

  async cancelarConversao(id: string, propriedadeId: string, motivo: string): Promise<Result<Conversao, Error>> {
    return this.transitarStatus(id, propriedadeId, 'cancelada', { motivo })
  }

  async invalidarConversao(id: string, propriedadeId: string, motivo?: string): Promise<Result<Conversao, Error>> {
    return this.transitarStatus(id, propriedadeId, 'invalida', { motivo })
  }

  async atualizarDataConversao(id: string, propriedadeId: string, data: Date): Promise<Result<Conversao, Error>> {
    const index = this.conversoes.findIndex(c => c.id === id && c.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Conversion not found'))
    const current = this.conversoes[index]

    const result = Conversao.create({
      ...current,
      dataConversao: data
    })

    if (result.isFail) return Result.fail(result.error)
    this.conversoes[index] = result.value
    return Result.ok(result.value)
  }

  // Auxiliar para testes
  public addConversaoDirectly(conversao: Conversao): void {
    const index = this.conversoes.findIndex(c => c.id === conversao.id)
    if (index !== -1) {
      this.conversoes[index] = conversao
    } else {
      this.conversoes.push(conversao)
    }
  }
}
