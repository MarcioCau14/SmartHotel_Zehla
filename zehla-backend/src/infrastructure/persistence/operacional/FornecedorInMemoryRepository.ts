import { createHmac, timingSafeEqual } from 'crypto'
import { Result } from '../../../shared/Result'
import { IFornecedorPort } from '../../../application/operacional/ports/IFornecedorPort'
import { Fornecedor } from '../../../domain/operacional/entities/Fornecedor'

export class FornecedorInMemoryRepository implements IFornecedorPort {
  private fornecedores: Map<string, Fornecedor> = new Map()

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
    const fornecedorResult = Fornecedor.create({
      id: `forn_${this.fornecedores.size + 1}_${Date.now()}`,
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
    this.fornecedores.set(fornecedorResult.value.id, fornecedorResult.value)
    return Result.ok(fornecedorResult.value)
  }

  async buscarFornecedorPorId(id: string): Promise<Result<Fornecedor | null, Error>> {
    const fornecedor = this.fornecedores.get(id)
    if (!fornecedor) return Result.ok(null)
    return Result.ok(fornecedor)
  }

  async listarAtivos(): Promise<Result<Fornecedor[], Error>> {
    const lista = Array.from(this.fornecedores.values()).filter(f => f.estaAtivo)
    return Result.ok(lista)
  }

  async listarPorEspecialidade(especialidade: string): Promise<Result<Fornecedor[], Error>> {
    const lista = Array.from(this.fornecedores.values()).filter(f => f.temEspecialidade(especialidade))
    return Result.ok(lista)
  }

  async suspenderFornecedor(id: string): Promise<Result<Fornecedor, Error>> {
    const fornecedor = this.fornecedores.get(id)
    if (!fornecedor) return Result.fail(new Error('Fornecedor não encontrado'))
    const suspenso = fornecedor.suspender()
    if (suspenso.isFail) return suspenso
    this.fornecedores.set(id, suspenso.value)
    return Result.ok(suspenso.value)
  }

  async reativarFornecedor(id: string): Promise<Result<Fornecedor, Error>> {
    const fornecedor = this.fornecedores.get(id)
    if (!fornecedor) return Result.fail(new Error('Fornecedor não encontrado'))
    const ativado = fornecedor.reativar()
    if (ativado.isFail) return ativado
    this.fornecedores.set(id, ativado.value)
    return Result.ok(ativado.value)
  }

  async avaliarFornecedor(id: string, nota: number): Promise<Result<Fornecedor, Error>> {
    const fornecedor = this.fornecedores.get(id)
    if (!fornecedor) return Result.fail(new Error('Fornecedor não encontrado'))
    const avaliado = fornecedor.avaliar(nota)
    if (avaliado.isFail) return avaliado
    this.fornecedores.set(id, avaliado.value)
    return Result.ok(avaliado.value)
  }

  async obterWebhookSecret(id: string): Promise<Result<string, Error>> {
    const fornecedor = this.fornecedores.get(id)
    if (!fornecedor) return Result.fail(new Error('Fornecedor não encontrado'))
    if (!fornecedor.webhookSecret) {
      return Result.fail(new Error('Webhook secret não configurado para este fornecedor'))
    }
    return Result.ok(fornecedor.webhookSecret)
  }
}
