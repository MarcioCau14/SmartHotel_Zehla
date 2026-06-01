import { IPacotePort } from '../../../../src/application/comercial/ports/IPacotePort'
import { Pacote, PacoteStatus } from '../../../../src/domain/comercial/entities/Pacote'
import { RegraPrecificacao } from '../../../../src/domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../../src/domain/comercial/value-objects/Money'
import { Result } from '../../../../src/shared/Result'

export class FakePacoteRepository implements IPacotePort {
  public pacotes: Pacote[] = []

  async criarPacote(dados: {
    propriedadeId: string
    nome: string
    descricao?: string
    tipoQuarto?: string
    capacidadeMaxima?: number
    servicosInclusos?: string[]
    regraPrecificacao: RegraPrecificacao
    validadeInicio?: Date
    validadeFim?: Date
    categorias?: string[]
    midias?: string[]
  }): Promise<Result<Pacote, Error>> {
    try {
      const id = `pacote_${Math.random().toString(36).substr(2, 9)}`

      const pacoteResult = Pacote.create({
        id,
        propriedadeId: dados.propriedadeId,
        nome: dados.nome,
        descricao: dados.descricao,
        tipoQuarto: dados.tipoQuarto,
        capacidadeMaxima: dados.capacidadeMaxima || 4,
        servicosInclusos: dados.servicosInclusos || [],
        regraPrecificacao: dados.regraPrecificacao,
        validadeInicio: dados.validadeInicio || new Date(),
        validadeFim: dados.validadeFim || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'ativo',
        versao: 1,
        categorias: dados.categorias,
        midias: dados.midias
      })

      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      this.pacotes.push(pacoteResult.value)
      return Result.ok(pacoteResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error creating package in fake repo'))
    }
  }

  async buscarPacotePorId(id: string, propriedadeId: string): Promise<Result<Pacote | null, Error>> {
    const pacote = this.pacotes.find(p => p.id === id && p.propriedadeId === propriedadeId)
    return Result.ok(pacote || null)
  }

  async listarPacotesPorPropriedade(
    propriedadeId: string,
    filtros?: { status?: string[]; tipoQuarto?: string; dataInicio?: Date; dataFim?: Date; ativoApenas?: boolean }
  ): Promise<Result<Pacote[], Error>> {
    let result = this.pacotes.filter(p => p.propriedadeId === propriedadeId)

    if (filtros) {
      if (filtros.ativoApenas) {
        result = result.filter(p => p.ehAtivo)
      }
      if (filtros.status && filtros.status.length > 0) {
        result = result.filter(p => filtros.status!.includes(p.status))
      }
      if (filtros.tipoQuarto) {
        result = result.filter(p => p.tipoQuarto === filtros.tipoQuarto)
      }
    }

    return Result.ok(result)
  }

  async atualizarPacote(
    id: string,
    propriedadeId: string,
    dados: {
      nome?: string
      descricao?: string
      tipoQuarto?: string
      capacidadeMaxima?: number
      servicosInclusos?: string[]
      validadeInicio?: Date
      validadeFim?: Date
      categorias?: string[]
      midias?: string[]
    }
  ): Promise<Result<Pacote, Error>> {
    const index = this.pacotes.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Package not found'))

    const current = this.pacotes[index]

    try {
      const pacoteResult = Pacote.create({
        id: current.id,
        propriedadeId: current.propriedadeId,
        nome: dados.nome !== undefined ? dados.nome : current.nome,
        descricao: dados.descricao !== undefined ? dados.descricao : current.descricao,
        tipoQuarto: dados.tipoQuarto !== undefined ? dados.tipoQuarto : current.tipoQuarto,
        capacidadeMaxima: dados.capacidadeMaxima !== undefined ? dados.capacidadeMaxima : current.capacidadeMaxima,
        servicosInclusos: dados.servicosInclusos !== undefined ? dados.servicosInclusos : current.servicosInclusos,
        regraPrecificacao: current.regraPrecificacao,
        validadeInicio: dados.validadeInicio !== undefined ? dados.validadeInicio : current.validadeInicio,
        validadeFim: dados.validadeFim !== undefined ? dados.validadeFim : current.validadeFim,
        status: current.status,
        versao: current.versao + 1,
        categorias: dados.categorias !== undefined ? dados.categorias : current.categorias,
        midias: dados.midias !== undefined ? dados.midias : current.midias
      })

      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)
      this.pacotes[index] = pacoteResult.value
      return Result.ok(pacoteResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error updating package in fake repo'))
    }
  }

  async atualizarRegraPrecificacao(id: string, propriedadeId: string, regra: RegraPrecificacao): Promise<Result<Pacote, Error>> {
    const index = this.pacotes.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Package not found'))
    const current = this.pacotes[index]

    const pacoteResult = Pacote.create({
      ...current,
      regraPrecificacao: regra,
      versao: current.versao + 1
    })

    if (pacoteResult.isFail) return Result.fail(pacoteResult.error)
    this.pacotes[index] = pacoteResult.value
    return Result.ok(pacoteResult.value)
  }

  private async transitarStatus(id: string, propriedadeId: string, status: PacoteStatus): Promise<Result<Pacote, Error>> {
    const index = this.pacotes.findIndex(p => p.id === id && p.propriedadeId === propriedadeId)
    if (index === -1) return Result.fail(new Error('Package not found'))
    const current = this.pacotes[index]

    const pacoteResult = Pacote.create({
      id: current.id,
      propriedadeId: current.propriedadeId,
      nome: current.nome,
      descricao: current.descricao,
      tipoQuarto: current.tipoQuarto,
      capacidadeMaxima: current.capacidadeMaxima,
      servicosInclusos: current.servicosInclusos,
      regraPrecificacao: current.regraPrecificacao,
      validadeInicio: current.validadeInicio,
      validadeFim: current.validadeFim,
      status,
      versao: current.versao + 1,
      categorias: current.categorias,
      midias: current.midias
    })

    if (pacoteResult.isFail) return Result.fail(pacoteResult.error)
    this.pacotes[index] = pacoteResult.value
    return Result.ok(pacoteResult.value)
  }

  async ativarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    return this.transitarStatus(id, propriedadeId, 'ativo')
  }

  async pausarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    return this.transitarStatus(id, propriedadeId, 'pausado')
  }

  async arquivarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    return this.transitarStatus(id, propriedadeId, 'arquivado')
  }

  async calcularValorTotal(
    pacoteId: string,
    propriedadeId: string,
    quantidadeHospedes: number,
    quantidadeDiarias: number
  ): Promise<Result<Money, Error>> {
    const pacote = this.pacotes.find(p => p.id === pacoteId && p.propriedadeId === propriedadeId)
    if (!pacote) return Result.fail(new Error('Package not found'))

    const base = pacote.regraPrecificacao.valorBase.centavos
    let total = base

    if (pacote.regraPrecificacao.tipo === 'por_diaria') {
      total = base * quantidadeDiarias
      if (pacote.regraPrecificacao.ajustePorOcupacao && quantidadeHospedes > 1) {
        // adicionar acréscimo para cada hóspede extra acima do primeiro
        const acrescimoPercentual = pacote.regraPrecificacao.ajustePorOcupacao / 100
        const extraGuests = quantidadeHospedes - 1
        total += base * acrescimoPercentual * extraGuests * quantidadeDiarias
      }
    }

    return Result.ok(new Money(Math.round(total)))
  }

  async getServicosInclusos(pacoteId: string, propriedadeId: string): Promise<Result<string[], Error>> {
    const pacote = this.pacotes.find(p => p.id === pacoteId && p.propriedadeId === propriedadeId)
    if (!pacote) return Result.fail(new Error('Package not found'))
    return Result.ok(pacote.servicosInclusos)
  }

  // Auxiliar para testes
  public addPacoteDirectly(pacote: Pacote): void {
    const index = this.pacotes.findIndex(p => p.id === pacote.id)
    if (index !== -1) {
      this.pacotes[index] = pacote
    } else {
      this.pacotes.push(pacote)
    }
  }
}
