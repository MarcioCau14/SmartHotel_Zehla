import { Result } from '../../../shared/Result'
import { Manutencao, StatusManutencao, TipoManutencao, CategoriaManutencao } from '../../../domain/operacional/entities/Manutencao'
import { Gravidade } from '../../../domain/operacional/value-objects/Gravidade'

export interface IManutencaoPort {
  criarManutencao(dados: {
    tarefaId: string
    propriedadeId: string
    tipo: TipoManutencao
    gravidade: Gravidade
    categoria: CategoriaManutencao
    ativoId?: string
    tipoAtivo?: string
    descricaoProblema: string
    fornecedorId?: string
    requerAprovacaoHumana?: boolean
  }): Promise<Result<Manutencao, Error>>

  buscarManutencaoPorId(id: string, propriedadeId: string): Promise<Result<Manutencao | null, Error>>

  listarManutencoesPorPropriedade(propriedadeId: string, filtros?: {
    status?: StatusManutencao[]
    gravidade?: string
    tipo?: TipoManutencao[]
    dataInicio?: Date
    dataFim?: Date
  }): Promise<Result<Manutencao[], Error>>

  listarManutencoesPorAtivo(ativoId: string, propriedadeId: string): Promise<Result<Manutencao[], Error>>

  listarInterditadas(propriedadeId: string): Promise<Result<Manutencao[], Error>>

  atualizarManutencao(id: string, propriedadeId: string, dados: {
    status?: StatusManutencao
    descricaoSolucao?: string
    dataInicio?: Date
    dataFim?: Date
    custoPecas?: number
    custoServico?: number
  }): Promise<Result<Manutencao, Error>>

  countInterdicoes24h(propriedadeId: string): Promise<Result<number, Error>>
}
