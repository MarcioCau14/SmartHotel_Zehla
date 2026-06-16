import { PrismaClient } from '@prisma/client'
import { Result } from '../../../shared/Result'
import { IPostPort } from '../../../application/marketing/ports/IPostPort'
import { Post, StatusPost } from '../../../domain/marketing/entities/Post'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'

export class PrismaPostRepository implements IPostPort {
  constructor(private readonly prisma: any, protected readonly propertyId?: string) {}

  private toData(post: Post): any {
    return {
      id: post.id,
      pousadaId: post.propriedadeId,
      canal: post.canal.value,
      tipo: post.tipo,
      conteudoId: post.conteudoId,
      midias: post.midias,
      dataAgendamento: post.dataAgendamento,
      status: post.status,
      dataPublicacao: post.dataPublicacao,
      dataCriacao: post.dataCriacao,
    }
  }

  private async hydrate(row: any): Promise<Result<Post, Error>> {
    try {
      const canalResult = CanalDistribuicao.criar(row.canal)
      if (canalResult.isFail) return Result.fail(canalResult.error)

      const result = Post.create({
        id: row.id,
        propriedadeId: row.pousadaId,
        canal: canalResult.value,
        tipo: row.tipo,
        conteudoId: row.conteudoId,
        midias: row.midias ?? [],
        dataAgendamento: row.dataAgendamento ?? null,
        status: row.status as StatusPost,
        dataPublicacao: row.dataPublicacao ?? null,
        dataCriacao: row.dataCriacao,
      })
      if (result.isFail) return Result.fail(result.error)
      return Result.ok(result.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao hidratar MarketingPost'))
    }
  }

  async agendarPost(dados: {
    propriedadeId: string; canal: string; tipo: string
    conteudoId: string; midias?: string[]; dataAgendamento?: Date
  }): Promise<Result<Post, Error>> {
    try {
      const canalResult = CanalDistribuicao.criar(dados.canal)
      if (canalResult.isFail) return Result.fail(canalResult.error)

      const id = `mkt_post_${Date.now()}_${Math.floor(Math.random() * 10000)}`

      const postResult = Post.create({
        id,
        propriedadeId: dados.propriedadeId,
        canal: canalResult.value,
        tipo: dados.tipo,
        conteudoId: dados.conteudoId,
        midias: dados.midias,
        dataAgendamento: dados.dataAgendamento,
      })
      if (postResult.isFail) return postResult

      const post = postResult.value
      await this.prisma.marketingPost.create({ data: this.toData(post) })
      return Result.ok(post)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao agendar post'))
    }
  }

  async publicar(id: string, propriedadeId: string): Promise<Result<Post, Error>> {
    try {
      const row = await this.prisma.marketingPost.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.fail(new Error('Post não encontrado'))

      const currentResult = await this.hydrate(row)
      if (currentResult.isFail) return currentResult

      const updated = currentResult.value.publicar()
      if (updated.isFail) return updated

      await this.prisma.marketingPost.update({
        where: { id },
        data: this.toData(updated.value),
      })
      return Result.ok(updated.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao publicar post'))
    }
  }

  async buscarPorId(id: string, propriedadeId: string): Promise<Result<Post | null, Error>> {
    try {
      const row = await this.prisma.marketingPost.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.ok(null)
      return this.hydrate(row)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao buscar post'))
    }
  }

  async listarPorCanal(canal: string, propriedadeId: string): Promise<Result<Post[], Error>> {
    try {
      const rows = await this.prisma.marketingPost.findMany({
        where: { pousadaId: propriedadeId, canal },
        orderBy: { dataCriacao: 'desc' },
      })
      const posts: Post[] = []
      for (const row of rows) {
        const result = await this.hydrate(row)
        if (result.isFail) return Result.fail(result.error)
        posts.push(result.value)
      }
      return Result.ok(posts)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao listar posts por canal'))
    }
  }

  async atualizarStatus(id: string, propriedadeId: string, status: StatusPost): Promise<Result<Post, Error>> {
    try {
      const row = await this.prisma.marketingPost.findFirst({
        where: { id, pousadaId: propriedadeId },
      })
      if (!row) return Result.fail(new Error('Post não encontrado'))

      const currentResult = await this.hydrate(row)
      if (currentResult.isFail) return currentResult

      await this.prisma.marketingPost.update({
        where: { id },
        data: { status },
      })
      return Result.ok(currentResult.value)
    } catch (error) {
      return Result.fail(error instanceof Error ? error : new Error('Erro ao atualizar status do post'))
    }
  }
}
