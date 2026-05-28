import { IPropostaPort } from '../../../../src/application/comercial/ports/IPropostaPort'
import { Proposta, PropostaStatus } from '../../../../src/domain/comercial/entities/Proposta'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Result } from '../../../../src/shared/Result'

export class FakePropostaRepository implements IPropostaPort {
  public propostas: Proposta[] = []

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
      const id = `proposta_${Math.random().toString(36).substr(2, 9)}`
      
      const valorTotal = new Money(50000) // R$ 500,00 simulado
      const valorSinal = new Money(10000) // R$ 100,00 (20%)
      
      // Proposta de rascunho por padrão dura 7 dias
      const validade = new Date()
      validade.setDate(validade.getDate() + 7)

      const propostaResult = Proposta.create({
        id,
        leadId: dados.leadId,
        propriedadeId: dados.propriedadeId,
        pacoteId: dados.pacoteId,
        dataCriacao: new Date(),
        dataCheckIn: dados.dataCheckIn,
        dataCheckOut: dados.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes,
        valorTotal,
        valorSinal,
        status: 'rascunho',
        validade,
        observacoes: dados.observacoes,
        historicoVersoes: []
      })

      if (propostaResult.isFail) return Result.fail(propostaResult.error)

      this.propostas.push(propostaResult.value)
      return Result.ok(propostaResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error creating proposal in fake repo'))
    }
  }

  async buscarPropostaPorId(id: string, propriedadeId: string): Promise<Result<Proposta | null, Error>> {
    const proposta = this.propostas.find(p => p.id === id && p.propriedadeId === propriedadeId)
    return Result.ok(proposta || null)
  }

  async listarPropostasPorLead(leadId: string, propriedadeId: string): Promise<Result<Proposta[], Error>> {
    const list = this.propostas.filter(p => p.leadId === leadId && p.propriedadeId === propriedadeId)
    return Result.ok(list)
  }

  async listarPropostasPorPacote(pacoteId: string, propriedadeId: string): Promise<Result<Proposta[], Error>> {
    const list = this.propostas.filter(p => p.pacoteId === pacoteId && p.propriedadeId === propriedadeId)
    return Result.ok(list)
  }

  async listarPropostasPorStatus(propriedadeId: string, status: string[], limite?: number): Promise<Result<Proposta[], Error>> {
    let result = this.propostas.filter(p => p.propriedadeId === propriedadeId && status.includes(p.status))
    if (limite !== undefined) {
      result = result.slice(0, limite)
    }
    return Result.ok(result)
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
    const index = this.propostas.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Proposal not found'))

    const current = this.propostas[index]

    try {
      const propostaResult = Proposta.create({
        id: current.id,
        leadId: current.leadId,
        propriedadeId: current.propriedadeId,
        pacoteId: current.pacoteId,
        dataCriacao: current.dataCriacao,
        dataCheckIn: dados.dataCheckIn !== undefined ? dados.dataCheckIn : current.dataCheckIn,
        dataCheckOut: dados.dataCheckOut !== undefined ? dados.dataCheckOut : current.dataCheckOut,
        quantidadeHospedes: dados.quantidadeHospedes !== undefined ? dados.quantidadeHospedes : current.quantidadeHospedes,
        valorTotal: current.valorTotal,
        valorSinal: current.valorSinal,
        descontoAplicado: current.descontoAplicado,
        status: current.status,
        validade: current.validade,
        observacoes: dados.observacoes !== undefined ? dados.observacoes : current.observacoes,
        historicoVersoes: current.historicoVersoes
      })

      if (propostaResult.isFail) return Result.fail(propostaResult.error)

      this.propostas[index] = propostaResult.value
      return Result.ok(propostaResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error updating proposal in fake repo'))
    }
  }

  async atualizarValorProposta(id: string, propriedadeId: string, valorTotal: Money): Promise<Result<Proposta, Error>> {
    const index = this.propostas.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Proposal not found'))
    const current = this.propostas[index]

    const propostaResult = Proposta.create({
      ...current,
      valorTotal
    })
    if (propostaResult.isFail) return Result.fail(propostaResult.error)
    this.propostas[index] = propostaResult.value
    return Result.ok(propostaResult.value)
  }

  async atualizarSinalProposta(id: string, propriedadeId: string, valorSinal: Money): Promise<Result<Proposta, Error>> {
    const index = this.propostas.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Proposal not found'))
    const current = this.propostas[index]

    const propostaResult = Proposta.create({
      ...current,
      valorSinal
    })
    if (propostaResult.isFail) return Result.fail(propostaResult.error)
    this.propostas[index] = propostaResult.value
    return Result.ok(propostaResult.value)
  }

  async atualizarDescontoProposta(id: string, propriedadeId: string, desconto: Money): Promise<Result<Proposta, Error>> {
    const index = this.propostas.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Proposal not found'))
    const current = this.propostas[index]

    const propostaResult = Proposta.create({
      ...current,
      descontoAplicado: desconto
    })
    if (propostaResult.isFail) return Result.fail(propostaResult.error)
    this.propostas[index] = propostaResult.value
    return Result.ok(propostaResult.value)
  }

  private async transitarStatus(id: string, propriedadeId: string, status: PropostaStatus): Promise<Result<Proposta, Error>> {
    const index = this.propostas.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Proposal not found'))
    const current = this.propostas[index]

    const propostaResult = Proposta.create({
      id: current.id,
      leadId: current.leadId,
      propriedadeId: current.propriedadeId,
      pacoteId: current.pacoteId,
      dataCriacao: current.dataCriacao,
      dataCheckIn: current.dataCheckIn,
      dataCheckOut: current.dataCheckOut,
      quantidadeHospedes: current.quantidadeHospedes,
      valorTotal: current.valorTotal,
      valorSinal: current.valorSinal,
      descontoAplicado: current.descontoAplicado,
      status,
      validade: current.validade,
      observacoes: current.observacoes,
      historicoVersoes: current.historicoVersoes
    })

    if (propostaResult.isFail) return Result.fail(propostaResult.error)
    this.propostas[index] = propostaResult.value
    return Result.ok(propostaResult.value)
  }

  async enviarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'enviada')
  }

  async visualizarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'vista')
  }

  async negociarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'negociacao')
  }

  async aceitarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'aceita')
  }

  async recusarProposta(id: string, propriedadeId: string, motivo?: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'recusada')
  }

  async expirarProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'expirada')
  }

  async converterProposta(id: string, propriedadeId: string): Promise<Result<Proposta, Error>> {
    return this.transitarStatus(id, propriedadeId, 'convertida')
  }

  // Auxiliar para testes
  public addPropostaDirectly(proposta: Proposta): void {
    const index = this.propostas.findIndex(p => p.id === proposta.id)
    if (index !== -1) {
      this.propostas[index] = proposta
    } else {
      this.propostas.push(proposta)
    }
  }
}
