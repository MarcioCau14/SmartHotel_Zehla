import { Result } from '../../../shared/Result'
import { Post, StatusPost } from '../../../domain/marketing/entities/Post'

export interface IPostPort {
  agendarPost(dados: {
    propriedadeId: string
    canal: string
    tipo: string
    conteudoId: string
    midias?: string[]
    dataAgendamento?: Date
  }): Promise<Result<Post, Error>>

  publicar(id: string, propriedadeId: string): Promise<Result<Post, Error>>

  buscarPorId(id: string, propriedadeId: string): Promise<Result<Post | null, Error>>

  listarPorCanal(canal: string, propriedadeId: string): Promise<Result<Post[], Error>>

  atualizarStatus(id: string, propriedadeId: string, status: StatusPost): Promise<Result<Post, Error>>
}
