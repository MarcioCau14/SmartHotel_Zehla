import { Result } from '../../../shared/Result'
import { Campanha } from '../../../domain/marketing/entities/Campanha'
import { Conteudo } from '../../../domain/marketing/entities/Conteudo'
import { ICampanhaPort } from '../ports/ICampanhaPort'
import { IConteudoPort } from '../ports/IConteudoPort'

export class CriarCampanhaRemarketingUseCase {
  constructor(
    private readonly campanhaPort: ICampanhaPort,
    private readonly conteudoPort: IConteudoPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    nome: string
    publicoAlvo: string
    tipo: string
    textoConteudo: string
    tom: string
    dataInicio: Date
    dataFim: Date
    possuiPromiseFinanceira?: boolean
    promiseFinanceiraValidada?: boolean
  }): Promise<Result<{ campanha: Campanha; conteudo: Conteudo }, Error>> {
    if (!dados.publicoAlvo || dados.publicoAlvo.trim().length === 0) {
      return Result.fail(new Error('CAMPANHA_SEM_SEGMENTO'))
    }

    if (dados.possuiPromiseFinanceira && !dados.promiseFinanceiraValidada) {
      return Result.fail(new Error('CAMPANHA_PROMISE_FINANCEIRA'))
    }

    const conteudoResult = await this.conteudoPort.criarConteudo({
      texto: dados.textoConteudo,
      tom: dados.tom,
    })
    if (conteudoResult.isFail) return Result.fail(conteudoResult.error)

    const campanhaResult = await this.campanhaPort.criarCampanha({
      propriedadeId: dados.propriedadeId,
      nome: dados.nome,
      publicoAlvo: dados.publicoAlvo,
      tipo: dados.tipo,
      conteudo: conteudoResult.value.id,
      dataInicio: dados.dataInicio,
      dataFim: dados.dataFim,
      possuiPromiseFinanceira: dados.possuiPromiseFinanceira,
      promiseFinanceiraValidada: dados.promiseFinanceiraValidada,
    })
    if (campanhaResult.isFail) return Result.fail(campanhaResult.error)

    return Result.ok({ campanha: campanhaResult.value, conteudo: conteudoResult.value })
  }
}
