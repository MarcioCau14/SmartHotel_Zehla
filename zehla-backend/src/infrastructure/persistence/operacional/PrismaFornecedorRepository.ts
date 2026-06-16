import { PrismaClient } from '@prisma/client'
import { IFornecedorPort } from '../../../application/operacional/ports/IFornecedorPort'
import { Fornecedor } from '../../../domain/operacional/entities/Fornecedor'
import { Result } from '../../../shared/Result'

export class PrismaFornecedorRepository implements IFornecedorPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(f: Fornecedor): any {
    return {
      id: f.id,
      dataCadastro: f.dataCadastro,
      razaoSocial: f.razaoSocial,
      cnpj: f.cnpj,
      nomeContato: f.nomeContato,
      emailContato: f.emailContato,
      telefoneContato: f.telefoneContato,
      especialidades: f.especialidades,
      status: f.status,
      slaMedioHoras: f.slaMedioHoras ?? null,
      taxaAvaliacao: f.taxaAvaliacao ?? null,
      webhookUrl: f.webhookUrl ?? null,
      webhookSecret: f.webhookSecret ?? null,
    }
  }

  private hydrate(row: any): Result<Fornecedor, Error> {
    try {
      return Fornecedor.create({
        id: row.id,
        dataCadastro: row.dataCadastro,
        razaoSocial: row.razaoSocial,
        cnpj: row.cnpj,
        nomeContato: row.nomeContato,
        emailContato: row.emailContato,
        telefoneContato: row.telefoneContato,
        especialidades: row.especialidades ?? [],
        status: row.status,
        slaMedioHoras: row.slaMedioHoras ?? undefined,
        taxaAvaliacao: row.taxaAvaliacao ?? undefined,
        webhookUrl: row.webhookUrl ?? undefined,
        webhookSecret: row.webhookSecret ?? undefined,
      })
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar fornecedor'))
    }
  }

  async criarFornecedor(dados: {
    razaoSocial: string
    cnpj: string
    nomeContato: string
    emailContato: string
    telefoneContato: string
    especialidades?: string[]
    slaMedioHoras?: number
    webhookUrl?: string
    webhookSecret?: string
  }): Promise<Result<Fornecedor, Error>> {
    try {
      const fornecedorResult = Fornecedor.create({
        id: `forn_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        dataCadastro: new Date(),
        razaoSocial: dados.razaoSocial,
        cnpj: dados.cnpj,
        nomeContato: dados.nomeContato,
        emailContato: dados.emailContato,
        telefoneContato: dados.telefoneContato,
        especialidades: dados.especialidades,
        slaMedioHoras: dados.slaMedioHoras,
        webhookUrl: dados.webhookUrl,
        webhookSecret: dados.webhookSecret,
      })
      if (fornecedorResult.isFail) return fornecedorResult

      const fornecedor = fornecedorResult.value
      await this.prisma.operacionalFornecedor.create({ data: this.toData(fornecedor) })
      return Result.ok(fornecedor)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro inesperado ao criar fornecedor'))
    }
  }

  async buscarFornecedorPorId(id: string): Promise<Result<Fornecedor | null, Error>> {
    try {
      const row = await this.prisma.operacionalFornecedor.findUnique({ where: { id } })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar fornecedor'))
    }
  }

  async listarAtivos(): Promise<Result<Fornecedor[], Error>> {
    try {
      const rows = await this.prisma.operacionalFornecedor.findMany({
        where: { status: 'ativo' },
        orderBy: { razaoSocial: 'asc' },
      })
      const result: Fornecedor[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar fornecedores ativos'))
    }
  }

  async listarPorEspecialidade(especialidade: string): Promise<Result<Fornecedor[], Error>> {
    try {
      const rows = await this.prisma.operacionalFornecedor.findMany({
        where: { especialidades: { has: especialidade }, status: 'ativo' },
        orderBy: { razaoSocial: 'asc' },
      })
      const result: Fornecedor[] = []
      for (const row of rows) {
        const r = this.hydrate(row)
        if (r.isFail) return Result.fail(r.error)
        result.push(r.value)
      }
      return Result.ok(result)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar fornecedores por especialidade'))
    }
  }

  async suspenderFornecedor(id: string): Promise<Result<Fornecedor, Error>> {
    try {
      const row = await this.prisma.operacionalFornecedor.findUnique({ where: { id } })
      if (!row) return Result.fail(new Error('Fornecedor não encontrado'))

      const currentResult = this.hydrate(row)
      if (currentResult.isFail) return currentResult

      const suspenso = currentResult.value.suspender()
      if (suspenso.isFail) return suspenso

      await this.prisma.operacionalFornecedor.update({
        where: { id },
        data: { status: 'suspenso' },
      })
      return suspenso
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao suspender fornecedor'))
    }
  }

  async reativarFornecedor(id: string): Promise<Result<Fornecedor, Error>> {
    try {
      const row = await this.prisma.operacionalFornecedor.findUnique({ where: { id } })
      if (!row) return Result.fail(new Error('Fornecedor não encontrado'))

      const currentResult = this.hydrate(row)
      if (currentResult.isFail) return currentResult

      const reativado = currentResult.value.reativar()
      if (reativado.isFail) return reativado

      await this.prisma.operacionalFornecedor.update({
        where: { id },
        data: { status: 'ativo' },
      })
      return reativado
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao reativar fornecedor'))
    }
  }

  async avaliarFornecedor(id: string, nota: number): Promise<Result<Fornecedor, Error>> {
    try {
      const row = await this.prisma.operacionalFornecedor.findUnique({ where: { id } })
      if (!row) return Result.fail(new Error('Fornecedor não encontrado'))

      const currentResult = this.hydrate(row)
      if (currentResult.isFail) return currentResult

      const avaliado = currentResult.value.avaliar(nota)
      if (avaliado.isFail) return avaliado

      await this.prisma.operacionalFornecedor.update({
        where: { id },
        data: { taxaAvaliacao: nota },
      })
      return avaliado
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao avaliar fornecedor'))
    }
  }

  async obterWebhookSecret(id: string): Promise<Result<string, Error>> {
    try {
      const row = await this.prisma.operacionalFornecedor.findUnique({ where: { id } })
      if (!row) return Result.fail(new Error('Fornecedor não encontrado'))
      if (!row.webhookSecret) return Result.fail(new Error('Fornecedor não possui webhook configurado'))
      return Result.ok(row.webhookSecret)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao obter webhook secret'))
    }
  }
}
