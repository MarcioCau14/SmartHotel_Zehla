import { Result } from '../../../../shared/Result'
import { Pacote } from '../../../domain/comercial/entities/Pacote'
import { RegraPrecificacao } from '../../../domain/comercial/value-objects/RegraPrecificacao'
import { Money } from '../../../domain/comercial/value-objects/Money'

export interface IPacotePort {
  criarPacote(dados: {
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
  }): Promise<Result<Pacote, Error>>
  
  buscarPacotePorId(id: string, propriedadeId: string): Promise<Result<Pacote | null, Error>>
  
  listarPacotesPorPropriedade(propriedadeId: string, filtros?: {
    status?: string[]
    tipoQuarto?: string
    dataInicio?: Date
    dataFim?: Date
    ativoApenas?: boolean
  }): Promise<Result<Pacote[], Error>>
  
  atualizarPacote(id: string, propriedadeId: string, dados: {
    nome?: string
    descricao?: string
    tipoQuarto?: string
    capacidadeMaxima?: number
    servicosInclusos?: string[]
    validadeInicio?: Date
    validadeFim?: Date
    categorias?: string[]
    midias?: string[]
  }): Promise<Result<Pacote, Error>>
  
  atualizarRegraPrecificacao(id: string, propriedadeId: string, regra: RegraPrecificacao): Promise<Result<Pacote, Error>>
  
  ativarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>>
  
  pausarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>>
  
  arquivarPacote(id: string, propriedadeId: string): Promise<Result<Pacote, Error>>
  
  calcularValorTotal(pacoteId: string, propriedadeId: string, quantidadeHospedes: number, quantidadeDiarias: number): Promise<Result<Money, Error>>
  
  getServicosInclusos(pacoteId: string, propriedadeId: string): Promise<Result<string[], Error>>
}