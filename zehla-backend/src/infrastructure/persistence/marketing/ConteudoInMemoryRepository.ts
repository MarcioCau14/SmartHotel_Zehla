import { Result } from '../../../shared/Result'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'
import { IConteudoPort } from '../../../application/marketing/ports/IConteudoPort'

export class ConteudoInMemoryRepository implements IConteudoPort {
  private conteudos: Map<string, Conteudo> = new Map()
  private versoes: Map<string, string[]> = new Map()

  async criarConteudo(dados: {
    texto: string; tom: string; conteudoAnteriorId?: string
  }): Promise<Result<Conteudo, Error>> {
    let versao = 1
    if (dados.conteudoAnteriorId) {
      const anterior = this.conteudos.get(dados.conteudoAnteriorId)
      if (anterior) versao = anterior.versao + 1
    }

    const conteudoResult = Conteudo.create({
      id: `ctd_${this.conteudos.size + 1}_${Date.now()}`,
      texto: dados.texto,
      tom: dados.tom,
      versao,
      conteudoAnteriorId: dados.conteudoAnteriorId,
    })
    if (conteudoResult.isFail) return conteudoResult

    const conteudo = conteudoResult.value
    this.conteudos.set(conteudo.id, conteudo)

    if (dados.conteudoAnteriorId) {
      const historico = this.versoes.get(dados.conteudoAnteriorId) || []
      historico.push(conteudo.id)
      this.versoes.set(dados.conteudoAnteriorId, historico)
    }

    return Result.ok(conteudo)
  }

  async buscarPorId(id: string): Promise<Result<Conteudo | null, Error>> {
    const conteudo = this.conteudos.get(id)
    return Result.ok(conteudo || null)
  }

  async listarVersoes(conteudoId: string): Promise<Result<Conteudo[], Error>> {
    const ids = this.versoes.get(conteudoId) || []
    const lista = ids.map(id => this.conteudos.get(id)).filter((c): c is Conteudo => c !== undefined)
    const original = this.conteudos.get(conteudoId)
    if (original) lista.unshift(original)
    return Result.ok(lista)
  }
}
