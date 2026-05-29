import { Result } from '../../../shared/Result'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'

export interface IConteudoPort {
  criarConteudo(dados: {
    texto: string
    tom: string
    conteudoAnteriorId?: string
  }): Promise<Result<Conteudo, Error>>

  buscarPorId(id: string): Promise<Result<Conteudo | null, Error>>

  listarVersoes(conteudoId: string): Promise<Result<Conteudo[], Error>>
}
