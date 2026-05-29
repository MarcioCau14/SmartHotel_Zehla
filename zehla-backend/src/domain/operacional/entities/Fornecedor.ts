import { Result } from '../../../shared/Result'

export type StatusFornecedor = 'ativo' | 'inativo' | 'suspenso'

const STATUS_VALIDOS: StatusFornecedor[] = ['ativo', 'inativo', 'suspenso']

export class Fornecedor {
  private constructor(
    public readonly id: string,
    public readonly dataCadastro: Date,
    public readonly razaoSocial: string,
    public readonly cnpj: string,
    public readonly nomeContato: string,
    public readonly emailContato: string,
    public readonly telefoneContato: string,
    public readonly especialidades: string[],
    public readonly status: StatusFornecedor,
    public readonly slaMedioHoras: number | undefined,
    public readonly taxaAvaliacao: number | undefined,
    public readonly webhookUrl: string | undefined,
    public readonly webhookSecret: string | undefined,
  ) {
    Object.freeze(this)
  }

  static create(props: {
    id: string
    dataCadastro: Date
    razaoSocial: string
    cnpj: string
    nomeContato: string
    emailContato: string
    telefoneContato: string
    especialidades?: string[]
    status?: string
    slaMedioHoras?: number
    taxaAvaliacao?: number
    webhookUrl?: string
    webhookSecret?: string
  }): Result<Fornecedor, Error> {
    if (!props.id || props.id.trim().length === 0) {
      return Result.fail(new Error('ID do fornecedor é obrigatório'))
    }
    if (!props.dataCadastro || !(props.dataCadastro instanceof Date) || isNaN(props.dataCadastro.getTime())) {
      return Result.fail(new Error('Data de cadastro é obrigatória'))
    }
    if (!props.razaoSocial || props.razaoSocial.trim().length === 0) {
      return Result.fail(new Error('Razão social é obrigatória'))
    }
    if (!props.cnpj || props.cnpj.trim().length === 0) {
      return Result.fail(new Error('CNPJ é obrigatório'))
    }
    if (!props.nomeContato || props.nomeContato.trim().length === 0) {
      return Result.fail(new Error('Nome do contato é obrigatório'))
    }
    if (!props.emailContato || props.emailContato.trim().length === 0) {
      return Result.fail(new Error('Email de contato é obrigatório'))
    }
    if (!props.telefoneContato || props.telefoneContato.trim().length === 0) {
      return Result.fail(new Error('Telefone de contato é obrigatório'))
    }

    const status = (props.status as StatusFornecedor) || 'ativo'
    if (!STATUS_VALIDOS.includes(status)) {
      return Result.fail(new Error(`Status de fornecedor inválido: ${props.status}`))
    }

    if (props.taxaAvaliacao !== undefined && (props.taxaAvaliacao < 0 || props.taxaAvaliacao > 5)) {
      return Result.fail(new Error('Taxa de avaliação deve estar entre 0 e 5'))
    }

    if (props.slaMedioHoras !== undefined && props.slaMedioHoras < 0) {
      return Result.fail(new Error('SLA médio em horas não pode ser negativo'))
    }

    if (!props.cnpj || props.cnpj.replace(/\D/g, '').length < 11) {
      return Result.fail(new Error('CNPJ inválido'))
    }

    return Result.ok(new Fornecedor(
      props.id.trim(),
      props.dataCadastro,
      props.razaoSocial.trim(),
      props.cnpj.replace(/\D/g, ''),
      props.nomeContato.trim(),
      props.emailContato.trim().toLowerCase(),
      props.telefoneContato.trim(),
      props.especialidades || [],
      status,
      props.slaMedioHoras || undefined,
      props.taxaAvaliacao || undefined,
      props.webhookUrl?.trim() || undefined,
      props.webhookSecret?.trim() || undefined,
    ))
  }

  get estaAtivo(): boolean {
    return this.status === 'ativo'
  }

  get estaSuspenso(): boolean {
    return this.status === 'suspenso'
  }

  suspender(): Result<Fornecedor, Error> {
    if (this.status === 'suspenso') {
      return Result.fail(new Error('Fornecedor já está suspenso'))
    }
    return Result.ok(new Fornecedor(
      this.id, this.dataCadastro, this.razaoSocial, this.cnpj, this.nomeContato,
      this.emailContato, this.telefoneContato, this.especialidades,
      'suspenso', this.slaMedioHoras, this.taxaAvaliacao, this.webhookUrl, this.webhookSecret,
    ))
  }

  reativar(): Result<Fornecedor, Error> {
    if (this.status === 'ativo') {
      return Result.fail(new Error('Fornecedor já está ativo'))
    }
    return Result.ok(new Fornecedor(
      this.id, this.dataCadastro, this.razaoSocial, this.cnpj, this.nomeContato,
      this.emailContato, this.telefoneContato, this.especialidades,
      'ativo', this.slaMedioHoras, this.taxaAvaliacao, this.webhookUrl, this.webhookSecret,
    ))
  }

  avaliar(nota: number): Result<Fornecedor, Error> {
    if (nota < 0 || nota > 5) {
      return Result.fail(new Error('Nota deve estar entre 0 e 5'))
    }
    return Result.ok(new Fornecedor(
      this.id, this.dataCadastro, this.razaoSocial, this.cnpj, this.nomeContato,
      this.emailContato, this.telefoneContato, this.especialidades,
      this.status, this.slaMedioHoras, nota, this.webhookUrl, this.webhookSecret,
    ))
  }

  temEspecialidade(especialidade: string): boolean {
    return this.especialidades.some(e => e.toLowerCase() === especialidade.toLowerCase())
  }

  atualizarWebhook(url: string, secret: string): Result<Fornecedor, Error> {
    if (!url || url.trim().length === 0) {
      return Result.fail(new Error('URL do webhook é obrigatória'))
    }
    if (!secret || secret.trim().length === 0) {
      return Result.fail(new Error('Secret do webhook é obrigatório'))
    }

    return Result.ok(new Fornecedor(
      this.id, this.dataCadastro, this.razaoSocial, this.cnpj, this.nomeContato,
      this.emailContato, this.telefoneContato, this.especialidades,
      this.status, this.slaMedioHoras, this.taxaAvaliacao,
      url.trim(), secret.trim(),
    ))
  }
}
