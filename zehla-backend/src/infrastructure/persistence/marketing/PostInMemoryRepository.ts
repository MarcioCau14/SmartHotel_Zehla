import { Result } from '../../../shared/Result'
import { Post, StatusPost } from '../../../domain/marketing/entities/Post'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'
import { IPostPort } from '../../../application/marketing/ports/IPostPort'

export class PostInMemoryRepository implements IPostPort {
  private posts: Map<string, Post> = new Map()

  async agendarPost(dados: {
    propriedadeId: string; canal: string; tipo: string
    conteudoId: string; midias?: string[]; dataAgendamento?: Date
  }): Promise<Result<Post, Error>> {
    const canalResult = CanalDistribuicao.criar(dados.canal)
    if (canalResult.isFail) return canalResult

    const postResult = Post.create({
      id: `pst_${this.posts.size + 1}_${Date.now()}`,
      propriedadeId: dados.propriedadeId,
      canal: canalResult.value,
      tipo: dados.tipo,
      conteudoId: dados.conteudoId,
      midias: dados.midias,
      dataAgendamento: dados.dataAgendamento,
    })
    if (postResult.isFail) return postResult
    this.posts.set(postResult.value.id, postResult.value)
    return Result.ok(postResult.value)
  }

  async publicar(id: string, propriedadeId: string): Promise<Result<Post, Error>> {
    const post = this.posts.get(id)
    if (!post || post.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Post não encontrado'))
    }
    const publicado = post.publicar()
    if (publicado.isFail) return publicado
    this.posts.set(id, publicado.value)
    return Result.ok(publicado.value)
  }

  async buscarPorId(id: string, propriedadeId: string): Promise<Result<Post | null, Error>> {
    const post = this.posts.get(id)
    if (!post || post.propriedadeId !== propriedadeId) return Result.ok(null)
    return Result.ok(post)
  }

  async listarPorCanal(canal: string, propriedadeId: string): Promise<Result<Post[], Error>> {
    const lista = Array.from(this.posts.values()).filter(
      p => p.propriedadeId === propriedadeId && p.canal.value === canal,
    )
    return Result.ok(lista)
  }

  async atualizarStatus(id: string, propriedadeId: string, status: StatusPost): Promise<Result<Post, Error>> {
    const post = this.posts.get(id)
    if (!post || post.propriedadeId !== propriedadeId) {
      return Result.fail(new Error('Post não encontrado'))
    }
    const updated = Post.create({
      id: post.id, propriedadeId: post.propriedadeId,
      canal: post.canal, tipo: post.tipo,
      conteudoId: post.conteudoId, midias: post.midias,
      dataAgendamento: post.dataAgendamento,
      status, dataCriacao: post.dataCriacao,
      dataPublicacao: post.dataPublicacao,
    })
    if (updated.isFail) return updated
    this.posts.set(id, updated.value)
    return Result.ok(updated.value)
  }
}
