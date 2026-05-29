import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { IOcupacaoPort } from '../ports/IOcupacaoPort'
import { IPropostaReadOnlyPort } from '../ports/IPropostaReadOnlyPort'

export interface SugestaoDesconto {
  descontoPercentual: number
  descontoValor: number
  valorOriginal: number
  valorComDesconto: number
  justificativa: string
  riscoReceita: string
  impactoOcupacao: string
}

export class SugerirDescontoEstrategicoUseCase {
  constructor(
    private readonly ocupacaoPort: IOcupacaoPort,
    private readonly propostaReadOnlyPort: IPropostaReadOnlyPort,
  ) {}

  async execute(dados: {
    propriedadeId: string
    propostaId?: string
    leadId?: string
    valorOriginal: number
  }): Promise<Result<SugestaoDesconto, Error>> {
    const hoje = new Date()
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)

    const ocupacaoMediaResult = await this.ocupacaoPort.mediaOcupacaoPeriodo(
      dados.propriedadeId, inicioMes, fimMes,
    )
    if (ocupacaoMediaResult.isFail) return Result.fail(ocupacaoMediaResult.error)
    const ocupacaoMedia = ocupacaoMediaResult.value

    let descontoPercentual = 0
    let riscoReceita = 'baixo'
    let impactoOcupacao = 'baixo'
    let justificativa = ''

    if (ocupacaoMedia.valor < 30) {
      descontoPercentual = 20
      riscoReceita = 'médio'
      impactoOcupacao = 'alto'
      justificativa = `Ocupação crítica de ${ocupacaoMedia.valor}% (<30%). Desconto estratégico de ${descontoPercentual}% para evitar quartos vagos.`
    } else if (ocupacaoMedia.valor < 60) {
      descontoPercentual = 10
      riscoReceita = 'baixo'
      impactoOcupacao = 'médio'
      justificativa = `Ocupação baixa de ${ocupacaoMedia.valor}% (<60%). Desconto moderado de ${descontoPercentual}% para estimular conversão.`
    } else {
      if (dados.leadId) {
        descontoPercentual = 5
        riscoReceita = 'baixo'
        impactoOcupacao = 'baixo'
        justificativa = `Ocupação saudável (${ocupacaoMedia.valor}%). Desconto gradual de ${descontoPercentual}% para lead em negociação.`
      } else {
        return Result.ok({
          descontoPercentual: 0,
          descontoValor: 0,
          valorOriginal: dados.valorOriginal,
          valorComDesconto: dados.valorOriginal,
          justificativa: `Ocupação saudável (${ocupacaoMedia.valor}%≥60%). Nenhum desconto necessário.`,
          riscoReceita: 'inexistente',
          impactoOcupacao: 'inexistente',
        })
      }
    }

    const descontoValor = Math.round(dados.valorOriginal * descontoPercentual / 100)
    const valorComDesconto = dados.valorOriginal - descontoValor

    return Result.ok({
      descontoPercentual,
      descontoValor,
      valorOriginal: dados.valorOriginal,
      valorComDesconto,
      justificativa,
      riscoReceita,
      impactoOcupacao,
    })
  }
}
