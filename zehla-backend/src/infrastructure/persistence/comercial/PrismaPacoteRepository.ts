import { PrismaClient } from '@prisma/client'
import { IPacotePort } from '../../../application/comercial/ports/IPacotePort'
import { Pacote } from '../../../domain/comercial/entities/Pacote'
import { Result } from '../../../shared/Result'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../domain/comercial/value-objects/Money'

export class PrismaPacoteRepository implements IPacotePort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(pacote: Pacote): any {
    const regra = pacote.regraPrecificacao!;
    return {
      id: pacote.id,
      propriedadeId: pacote.propriedadeId,
      nome: pacote.nome,
      descricao: pacote.descricao || null,
      tipoQuarto: pacote.tipoQuarto || null,
      capacidadeMaxima: pacote.capacidadeMaxima || null,
      servicosInclusos: pacote.servicosInclusos ? JSON.stringify(pacote.servicosInclusos) : null,
      status: pacote.status,
      versao: pacote.versao,
      categorias: pacote.categorias ? JSON.stringify(pacote.categorias) : null,
      midias: pacote.midias ? JSON.stringify(pacote.midias) : null,
      
      // RegraPrecificacao
      regraTipo: regra.tipo,
      regraValorBase: regra.valorBase.centavos,
      regraValorPorNoite: regra.valorPorNoite?.centavos || null,
      regraValorPorPessoa: regra.valorPorPessoa?.centavos || null,
      regraAcrescimoPessoa: regra.acrescimoAdicionalPessoa || null,
      regraDescontoEstanciaLonga: regra.descontoEstanciaLonga || null,
      regraNoitesParaDesconto: regra.noitesParaDesconto || null,
      regraSazonalidade: regra.sazonalidade ? JSON.stringify(regra.sazonalidade) : null,

      validadeInicio: pacote.validadeInicio || null,
      validadeFim: pacote.validadeFim || null
    }
  }

  private hydrate(row: any): Result<Pacote, Error> {
    try {
      const valorBaseResult = Money.criar(row.regraValorBase)
      if (valorBaseResult.isFail) return Result.fail(valorBaseResult.error)

      let valorPorNoite: Money | undefined
      if (row.regraValorPorNoite !== null && row.regraValorPorNoite !== undefined) {
        const vResult = Money.criar(row.regraValorPorNoite)
        if (vResult.isFail) return Result.fail(vResult.error)
        valorPorNoite = vResult.value
      }

      let valorPorPessoa: Money | undefined
      if (row.regraValorPorPessoa !== null && row.regraValorPorPessoa !== undefined) {
        const vResult = Money.criar(row.regraValorPorPessoa)
        if (vResult.isFail) return Result.fail(vResult.error)
        valorPorPessoa = vResult.value
      }

      let sazonalidade: any[] | undefined
      if (row.regraSazonalidade) {
        try {
          sazonalidade = JSON.parse(row.regraSazonalidade)
        } catch {
          sazonalidade = undefined
        }
      }

      const regraResult = RegraPrecificacao.criar({
        tipo: row.regraTipo as any,
        valorBase: valorBaseResult.value,
        valorPorNoite,
        valorPorPessoa,
        acrescimoAdicionalPessoa: row.regraAcrescimoPessoa !== null ? row.regraAcrescimoPessoa : undefined,
        descontoEstanciaLonga: row.regraDescontoEstanciaLonga !== null ? row.regraDescontoEstanciaLonga : undefined,
        noitesParaDesconto: row.regraNoitesParaDesconto !== null ? row.regraNoitesParaDesconto : undefined,
        sazonalidade
      })

      if (regraResult.isFail) return Result.fail(regraResult.error)

      let servicosInclusos: string[] | undefined
      if (row.servicosInclusos) {
        try {
          servicosInclusos = JSON.parse(row.servicosInclusos)
        } catch {
          servicosInclusos = undefined
        }
      }

      let categorias: string[] | undefined
      if (row.categorias) {
        try {
          categorias = JSON.parse(row.categorias)
        } catch {
          categorias = undefined
        }
      }

      let midias: string[] | undefined
      if (row.midias) {
        try {
          midias = JSON.parse(row.midias)
        } catch {
          midias = undefined
        }
      }

      const pacoteProps = {
        id: row.id,
        propriedadeId: row.propriedadeId,
        nome: row.nome,
        descricao: row.descricao || undefined,
        tipoQuarto: row.tipoQuarto || undefined,
        capacidadeMaxima: row.capacidadeMaxima !== null ? row.capacidadeMaxima : undefined,
        servicosInclusos,
        regraPrecificacao: regraResult.value,
        validadeInicio: row.validadeInicio || undefined,
        validadeFim: row.validadeFim || undefined,
        status: row.status as any,
        versao: row.versao,
        categorias,
        midias
      }

      return Pacote.create(pacoteProps)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Error hydrating ComercialPacote'))
    }
  }

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
      const id = `pacote_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const props = {
        id,
        propriedadeId: dados.propriedadeId, // RLS
        nome: dados.nome,
        descricao: dados.descricao,
        tipoQuarto: dados.tipoQuarto,
        capacidadeMaxima: dados.capacidadeMaxima,
        servicosInclusos: dados.servicosInclusos,
        regraPrecificacao: dados.regraPrecificacao,
        validadeInicio: dados.validadeInicio,
        validadeFim: dados.validadeFim,
        status: 'ativo' as const,
        versao: 1,
        categorias: dados.categorias,
        midias: dados.midias
      }

      const pacoteResult = Pacote.create(props)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      const pacote = pacoteResult.value
      const data = this.toData(pacote)

      await this.prisma.comercialPacote.create({ data })

      return Result.ok(pacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error creating package'))
    }
  }

  async buscarPacotePorId(id: string, propriedadeId: string): Promise<Result<Pacote | null, Error>> {
    try {
      // RLS - Filtro silencioso por propriedadeId
      const row = await this.prisma.comercialPacote.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.ok(null)

      const pacoteResult = this.hydrate(row)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      return Result.ok(pacoteResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error finding package by ID'))
    }
  }

  async listarPacotesPorPropriedade(
    propriedadeId: string,
    filtros?: {
      status?: string[]
      tipoQuarto?: string
      dataInicio?: Date
      dataFim?: Date
      ativoApenas?: boolean
    }
  ): Promise<Result<Pacote[], Error>> {
    try {
      const where: any = {
        propriedadeId // RLS
      }

      if (filtros) {
        if (filtros.status && filtros.status.length > 0) {
          where.status = { in: filtros.status }
        } else if (filtros.ativoApenas) {
          where.status = 'ativo'
        }

        if (filtros.tipoQuarto) {
          where.tipoQuarto = filtros.tipoQuarto
        }

        // Filtros de vigência / validade
        if (filtros.dataInicio) {
          where.validadeInicio = { lte: filtros.dataInicio }
        }
        if (filtros.dataFim) {
          where.validadeFim = { gte: filtros.dataFim }
        }
      }

      const rows = await this.prisma.comercialPacote.findMany({ where })

      const pacotes: Pacote[] = []
      for (const row of rows) {
        const pacoteResult = this.hydrate(row)
        if (pacoteResult.isFail) return Result.fail(pacoteResult.error)
        pacotes.push(pacoteResult.value)
      }

      return Result.ok(pacotes)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error listing packages'))
    }
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
    try {
      // RLS - Garante propriedadeId
      const row = await this.prisma.comercialPacote.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.fail(new Error('Package not found or access denied'))

      const currentPacoteResult = this.hydrate(row)
      if (currentPacoteResult.isFail) return Result.fail(currentPacoteResult.error)
      const pacote = currentPacoteResult.value

      const updatedProps = {
        id: pacote.id,
        propriedadeId: pacote.propriedadeId,
        nome: dados.nome !== undefined ? dados.nome : pacote.nome,
        descricao: dados.descricao !== undefined ? dados.descricao : pacote.descricao,
        tipoQuarto: dados.tipoQuarto !== undefined ? dados.tipoQuarto : pacote.tipoQuarto,
        capacidadeMaxima: dados.capacidadeMaxima !== undefined ? dados.capacidadeMaxima : pacote.capacidadeMaxima,
        servicosInclusos: dados.servicosInclusos !== undefined ? dados.servicosInclusos : pacote.servicosInclusos,
        regraPrecificacao: pacote.regraPrecificacao,
        validadeInicio: dados.validadeInicio !== undefined ? dados.validadeInicio : pacote.validadeInicio,
        validadeFim: dados.validadeFim !== undefined ? dados.validadeFim : pacote.validadeFim,
        status: pacote.status,
        versao: pacote.versao + 1, // Auto-incrementa versão na atualização de campos
        categorias: dados.categorias !== undefined ? dados.categorias : pacote.categorias,
        midias: dados.midias !== undefined ? dados.midias : pacote.midias
      }

      const updatedResult = Pacote.create(updatedProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedPacote = updatedResult.value
      const data = this.toData(updatedPacote)

      await this.prisma.comercialPacote.update({
        where: { id },
        data
      })

      return Result.ok(updatedPacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating package'))
    }
  }

  async atualizarRegraPrecificacao(id: string, propriedadeId: string, regra: RegraPrecificacao): Promise<Result<Pacote, Error>> {
    try {
      const row = await this.prisma.comercialPacote.findFirst({
        where: {
          id,
          propriedadeId
        }
      })

      if (!row) return Result.fail(new Error('Package not found or access denied'))

      const currentPacoteResult = this.hydrate(row)
      if (currentPacoteResult.isFail) return Result.fail(currentPacoteResult.error)
      const pacote = currentPacoteResult.value

      const updatedProps = {
        id: pacote.id,
        propriedadeId: pacote.propriedadeId,
        nome: pacote.nome,
        descricao: pacote.descricao,
        tipoQuarto: pacote.tipoQuarto,
        capacidadeMaxima: pacote.capacidadeMaxima,
        servicosInclusos: pacote.servicosInclusos,
        regraPrecificacao: regra,
        validadeInicio: pacote.validadeInicio,
        validadeFim: pacote.validadeFim,
        status: pacote.status,
        versao: pacote.versao + 1,
        categorias: pacote.categorias,
        midias: pacote.midias
      }

      const updatedResult = Pacote.create(updatedProps)
      if (updatedResult.isFail) return Result.fail(updatedResult.error)

      const updatedPacote = updatedResult.value
      const data = this.toData(updatedPacote)

      await this.prisma.comercialPacote.update({
        where: { id },
        data
      })

      return Result.ok(updatedPacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error updating pricing rule'))
    }
  }

  async ativarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    try {
      const row = await this.prisma.comercialPacote.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Package not found or access denied'))

      const pacoteResult = this.hydrate(row)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      const activatedResult = pacoteResult.value.ativar()
      if (activatedResult.isFail) return Result.fail(activatedResult.error)

      const activatedPacote = activatedResult.value
      await this.prisma.comercialPacote.update({
        where: { id },
        data: { status: 'ativo' }
      })

      return Result.ok(activatedPacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error activating package'))
    }
  }

  async pausarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    try {
      const row = await this.prisma.comercialPacote.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Package not found or access denied'))

      const pacoteResult = this.hydrate(row)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      const pausedResult = pacoteResult.value.pausar()
      if (pausedResult.isFail) return Result.fail(pausedResult.error)

      const pausedPacote = pausedResult.value
      await this.prisma.comercialPacote.update({
        where: { id },
        data: { status: 'pausado' }
      })

      return Result.ok(pausedPacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error pausing package'))
    }
  }

  async arquivarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>> {
    try {
      const row = await this.prisma.comercialPacote.findFirst({
        where: { id, propriedadeId }
      })
      if (!row) return Result.fail(new Error('Package not found or access denied'))

      const pacoteResult = this.hydrate(row)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      const archivedResult = pacoteResult.value.arquivar()
      if (archivedResult.isFail) return Result.fail(archivedResult.error)

      const archivedPacote = archivedResult.value
      await this.prisma.comercialPacote.update({
        where: { id },
        data: { status: 'arquivado' }
      })

      return Result.ok(archivedPacote)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error archiving package'))
    }
  }

  async calcularValorTotal(
    pacoteId: string,
    propriedadeId: string,
    quantidadeHospedes: number,
    quantidadeDiarias: number
  ): Promise<Result<Money, Error>> {
    try {
      const pacoteResult = await this.buscarPacotePorId(pacoteId, propriedadeId)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      const pacote = pacoteResult.value
      if (!pacote) return Result.fail(new Error('Package not found'))

      return pacote.calcularValorTotal(quantidadeHospedes, quantidadeDiarias)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error calculating total value'))
    }
  }

  async getServicosInclusos(pacoteId: string, propriedadeId: string): Promise<Result<string[], Error>> {
    try {
      const pacoteResult = await this.buscarPacotePorId(pacoteId, propriedadeId)
      if (pacoteResult.isFail) return Result.fail(pacoteResult.error)

      const pacote = pacoteResult.value
      if (!pacote) return Result.fail(new Error('Package not found'))

      return Result.ok(pacote.getServicosInclusos())
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error fetching included services'))
    }
  }
}
