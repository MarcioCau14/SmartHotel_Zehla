import { Result } from '../../../shared/Result'
import { Fornecedor } from '../../../domain/operacional/entities/Fornecedor'

export interface IFornecedorPort {
  criarFornecedor(dados: {
    razaoSocial: string
    cnpj: string
    nomeContato: string
    emailContato: string
    telefoneContato: string
    especialidades?: string[]
    slaMedioHoras?: number
    webhookUrl?: string
    webhookSecret?: string
  }): Promise<Result<Fornecedor, Error>>

  buscarFornecedorPorId(id: string): Promise<Result<Fornecedor | null, Error>>

  listarAtivos(): Promise<Result<Fornecedor[], Error>>

  listarPorEspecialidade(especialidade: string): Promise<Result<Fornecedor[], Error>>

  suspenderFornecedor(id: string): Promise<Result<Fornecedor, Error>>

  reativarFornecedor(id: string): Promise<Result<Fornecedor, Error>>

  avaliarFornecedor(id: string, nota: number): Promise<Result<Fornecedor, Error>>

  obterWebhookSecret(id: string): Promise<Result<string, Error>>
}
