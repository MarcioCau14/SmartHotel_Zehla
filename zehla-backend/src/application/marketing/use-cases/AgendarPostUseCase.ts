import { Result } from '../../../shared/Result'
import { Post } from '../../../domain/marketing/entities/Post'
import { CanalDistribuicao } from '../../../domain/marketing/value-objects/CanalDistribuicao'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'
import { IPostPort } from '../ports/IPostPort'
import { IConteudoPort } from '../ports/IConteudoPort'

export class AgendarPostUseCase {
  constructor(
    private readonly postPort: IPostPort,
    private readonly conteudoPort: IConteudoPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    canal: string
    tipo: string
    texto: string
    tom: string
    midias?: string[]
    dataAgendamento?: Date
  }): Promise<Result<{ post: Post; conteudo: Conteudo }, Error>> {
    const canalResult = CanalDistribuicao.criar(dados.canal)
    if (canalResult.isFail) return Result.fail(canalResult.error)
    if (!canalResult.value.isSocial) {
      return Result.fail(new Error('POST_CANAL_INVALIDO'))
    }

    if (dados.tipo === 'promocional' && (!dados.midias || dados.midias.length === 0)) {
      return Result.fail(new Error('POST_SEM_MIDIA_PROMOCIONAL'))
    }

    const conteudoResult = await this.conteudoPort.criarConteudo({
      texto: dados.texto,
      tom: dados.tom,
    })
    if (conteudoResult.isFail) return Result.fail(conteudoResult.error)

    const postResult = await this.postPort.agendarPost({
      propriedadeId: dados.propriedadeId,
      canal: dados.canal,
      tipo: dados.tipo,
      conteudoId: conteudoResult.value.id,
      midias: dados.midias,
      dataAgendamento: dados.dataAgendamento,
    })
    if (postResult.isFail) return Result.fail(postResult.error)

    if (dados.dataAgendamento) {
      const agendado = postResult.value.agendar(dados.dataAgendamento)
      if (agendado.isFail) return Result.fail(agendado.error)

      const atualizado = await this.postPort.atualizarStatus(postResult.value.id, dados.propriedadeId, 'agendado')
      if (atualizado.isFail) return Result.fail(atualizado.error)

      return Result.ok({ post: atualizado.value, conteudo: conteudoResult.value })
    }

    return Result.ok({ post: postResult.value, conteudo: conteudoResult.value })
  }
}
