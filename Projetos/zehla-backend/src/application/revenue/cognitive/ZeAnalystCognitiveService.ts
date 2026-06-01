import { Result } from '../../../shared/Result'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { ITarifaPort } from '../ports/ITarifaPort'
import { IOcupacaoPort } from '../ports/IOcupacaoPort'
import { ISazonalidadePort } from '../ports/ISazonalidadePort'
import { IForecastPort } from '../ports/IForecastPort'
import { IReservaReadOnlyPort } from '../ports/IReservaReadOnlyPort'
import { IPacoteReadOnlyPort } from '../ports/IPacoteReadOnlyPort'
import { IPropostaReadOnlyPort } from '../ports/IPropostaReadOnlyPort'
import { CalcularTarifaDinamicaUseCase } from '../use-cases/CalcularTarifaDinamicaUseCase'
import { ValidarViolacaoBreakEvenUseCase } from '../use-cases/ValidarViolacaoBreakEvenUseCase'
import { SugerirDescontoEstrategicoUseCase } from '../use-cases/SugerirDescontoEstrategicoUseCase'
import { GerarForecastDemandaUseCase } from '../use-cases/GerarForecastDemandaUseCase'
import { CalcularMetricasRevenueUseCase } from '../use-cases/CalcularMetricasRevenueUseCase'
import { RebalancearTarifasPorCanalUseCase } from '../use-cases/RebalancearTarifasPorCanalUseCase'
import { ZeAnalystInput, ZeCognitiveOutput, ZcpHandoffPackage, createZcpHandoff, translateError } from './ZeAnalystCognitiveTypes'

function generateId(): string {
  return `za-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class ZeAnalystCognitiveService {
  constructor(
    private readonly tarifaPort: ITarifaPort,
    private readonly ocupacaoPort: IOcupacaoPort,
    private readonly sazonalidadePort: ISazonalidadePort,
    private readonly forecastPort: IForecastPort,
    private readonly reservaReadOnlyPort: IReservaReadOnlyPort,
    private readonly pacoteReadOnlyPort: IPacoteReadOnlyPort,
    private readonly propostaReadOnlyPort: IPropostaReadOnlyPort,
    private readonly calcularTarifaDinamicaUseCase: CalcularTarifaDinamicaUseCase,
    private readonly validarBreakEvenUseCase: ValidarViolacaoBreakEvenUseCase,
    private readonly sugerirDescontoUseCase: SugerirDescontoEstrategicoUseCase,
    private readonly gerarForecastUseCase: GerarForecastDemandaUseCase,
    private readonly calcularMetricasUseCase: CalcularMetricasRevenueUseCase,
    private readonly rebalancearTarifasUseCase: RebalancearTarifasPorCanalUseCase,
    private readonly zcpSecret: string,
  ) {}

  async processIntent(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    try {
      switch (input.intent) {
        case 'CALCULAR_TARIFA_DINAMICA':
          return await this.handleCalcularTarifaDinamica(input)
        case 'VALIDAR_BREAK_EVEN':
          return await this.handleValidarBreakEven(input)
        case 'SUGERIR_DESCONTO_ESTRATEGICO':
          return await this.handleSugerirDesconto(input)
        case 'GERAR_FORECAST':
          return await this.handleGerarForecast(input)
        case 'CALCULAR_METRICAS_REVENUE':
          return await this.handleCalcularMetricas(input)
        case 'REBALANCEAR_TARIFAS_POR_CANAL':
          return await this.handleRebalancearTarifas(input)
        default:
          return this.output(false, 'Intenção não reconhecida pelo Zé-Analyst.', input.messageId, 0.3)
      }
    } catch {
      return this.output(false, 'Erro interno no Zé-Analyst. Operação cancelada.', input.messageId, 0.0, true)
    }
  }

  private async handleCalcularTarifaDinamica(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    const { tipoQuarto, data } = input.payload as Record<string, unknown>
    if (!tipoQuarto || !data) {
      return this.output(false, 'Preciso do tipo de quarto e da data para calcular a tarifa dinâmica.', input.messageId, 0.4)
    }

    const result = await this.calcularTarifaDinamicaUseCase.execute({
      propriedadeId: input.propriedadeId,
      tipoQuarto: tipoQuarto as string,
      data: new Date(data as string),
    })

    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }

    const s = result.value

    if (s.bloqueadoPorFeriado) {
      const handoff = this.requestHandoff({
        destino: 'ze-host',
        contexto: `Tarifa de feriado bloqueada para ${s.tipoQuarto}.`,
        motivo: s.justificativa,
        payload: { regraId: s.regraId, tipoQuarto: s.tipoQuarto, canal: s.canal },
      })
      return this.output(
        true, s.justificativa, input.messageId, 0.5, true, true, 'ze-host',
        { ...s, handoff },
      )
    }

    if (s.bloqueadoPorPromocional) {
      const handoff = this.requestHandoff({
        destino: 'ze-host',
        contexto: `Tarifa promocional não pode ser alterada pelo Zé-Analyst.`,
        motivo: s.justificativa,
        payload: { regraId: s.regraId, tipoQuarto: s.tipoQuarto, canal: s.canal },
      })
      return this.output(
        true, s.justificativa, input.messageId, 0.5, true, true, 'ze-host',
        { ...s, handoff },
      )
    }

    if (s.violaBreakEven) {
      return this.output(false, `Break-even violation: ${s.justificativa}`, input.messageId, 0.3, true)
    }

    return this.output(
      true,
      `${s.justificativa} Valor atual: ${(s.valorAtual / 100).toFixed(2)}. Valor sugerido: ${(s.valorSugerido / 100).toFixed(2)}. Delta: ${s.deltaPercentual}%.`,
      input.messageId,
      s.deltaPercentual > 0 ? 0.85 : 0.9,
      false, false, undefined,
      s,
    )
  }

  private async handleValidarBreakEven(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    const { regraTarifariaId, valorPretendido } = input.payload as Record<string, unknown>
    if (!regraTarifariaId || !valorPretendido) {
      return this.output(false, 'Preciso do ID da regra tarifária e do valor pretendido.', input.messageId, 0.4)
    }

    const valorResult = Money.criar(Math.round((valorPretendido as number) * 100))
    if (valorResult.isFail) {
      return this.output(false, 'Valor pretendido inválido.', input.messageId, 0.3)
    }

    const result = await this.validarBreakEvenUseCase.execute({
      propriedadeId: input.propriedadeId,
      regraTarifariaId: regraTarifariaId as string,
      valorPretendido: valorResult.value,
    })

    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }

    const v = result.value
    if (!v.valido) {
      return this.output(
        false,
        `Valor de ${(v.valorDiaria / 100).toFixed(2)} viola break-even de ${(v.breakEven / 100).toFixed(2)}. Operação bloqueada.`,
        input.messageId,
        0.3,
        true,
      )
    }

    if (v.breakEvenAtingido) {
      return this.output(
        true,
        `Valor válido. Margem de ${v.margemPercentual}% sobre o break-even. Break-even proximo (≤10%).`,
        input.messageId,
        0.7,
        true,
        false,
        undefined,
        v,
      )
    }

    return this.output(
      true,
      `Valor válido. Margem de ${v.margemPercentual}% sobre o break-even de ${(v.breakEven / 100).toFixed(2)}.`,
      input.messageId,
      0.95,
      false, false, undefined,
      v,
    )
  }

  private async handleSugerirDesconto(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    const { propostaId, leadId, valorOriginal } = input.payload as Record<string, unknown>
    if (!valorOriginal) {
      return this.output(false, 'Preciso do valor original da proposta para calcular desconto.', input.messageId, 0.4)
    }

    const result = await this.sugerirDescontoUseCase.execute({
      propriedadeId: input.propriedadeId,
      propostaId: propostaId as string | undefined,
      leadId: leadId as string | undefined,
      valorOriginal: Math.round((valorOriginal as number) * 100),
    })

    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }

    const s = result.value
    if (s.descontoPercentual === 0) {
      return this.output(
        true, s.justificativa, input.messageId, 0.9,
        false, false, undefined,
        s,
      )
    }

    return this.output(
      true,
      `Desconto sugerido: ${s.descontoPercentual}% (${(s.descontoValor / 100).toFixed(2)}). Novo valor: ${(s.valorComDesconto / 100).toFixed(2)}. Risco: ${s.riscoReceita}. ${s.justificativa}`,
      input.messageId,
      0.85,
      false, false, undefined,
      s,
    )
  }

  private async handleGerarForecast(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    const { horizonte } = input.payload as Record<string, unknown>
    if (!horizonte || ![7, 30, 90].includes(horizonte as number)) {
      return this.output(false, 'Preciso do horizonte (7, 30 ou 90 dias) para gerar o forecast.', input.messageId, 0.4)
    }

    const result = await this.gerarForecastUseCase.execute({
      propriedadeId: input.propriedadeId,
      horizonte: horizonte as 7 | 30 | 90,
    })

    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }

    const f = result.value
    const receitaTotal = f.receitaProjetadaTotal

    return this.output(
      true,
      `Forecast de ${f.horizonte}d gerado. Confiança: ${Math.round(f.confiancaMedia * 100)}%. Receita projetada: ${(receitaTotal.centavos / 100).toFixed(2)}. Modelo: ${f.assinaturaModelo}.`,
      input.messageId,
      f.confiancaMedia,
      false, false, undefined,
      {
        forecastId: f.id,
        horizonte: f.horizonte,
        confiancaMedia: f.confiancaMedia,
        receitaProjetada: receitaTotal.centavos,
        ocupacaoMedia: Math.round(f.previsaoOcupacao.reduce((a, b) => a + b, 0) / f.previsaoOcupacao.length),
        assinaturaModelo: f.assinaturaModelo,
      },
    )
  }

  private async handleCalcularMetricas(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    const { dataInicio, dataFim, custoOperacionalPorQuarto } = input.payload as Record<string, unknown>
    if (!dataInicio || !dataFim) {
      return this.output(false, 'Preciso das datas de início e fim para calcular métricas.', input.messageId, 0.4)
    }

    const result = await this.calcularMetricasUseCase.execute({
      propriedadeId: input.propriedadeId,
      dataInicio: new Date(dataInicio as string),
      dataFim: new Date(dataFim as string),
      custoOperacionalPorQuarto: Math.round((custoOperacionalPorQuarto as number || 0) * 100),
    })

    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }

    const m = result.value
    return this.output(
      true,
      `Métricas do período: ADR ${(m.adr / 100).toFixed(2)} | RevPAR ${(m.revpar / 100).toFixed(2)} | GOPPAR ${(m.goppar / 100).toFixed(2)} | Ocupação ${m.taxaOcupacaoMedia}% | Break-even ratio ${m.breakEvenRatio}%.`,
      input.messageId,
      0.9,
      false, false, undefined,
      m,
    )
  }

  private async handleRebalancearTarifas(input: ZeAnalystInput): Promise<ZeCognitiveOutput> {
    const { data, elasticidadePorCanal } = input.payload as Record<string, unknown>
    if (!data) {
      return this.output(false, 'Preciso da data de referência para rebalancear tarifas.', input.messageId, 0.4)
    }

    const result = await this.rebalancearTarifasUseCase.execute({
      propriedadeId: input.propriedadeId,
      data: new Date(data as string),
      elasticidadePorCanal: (elasticidadePorCanal as Record<string, number>) || {},
    })

    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }

    const ajustes = result.value
    const totalAjustes = ajustes.filter(a => a.deltaPercentual > 0).length

    return this.output(
      true,
      `${ajustes.length} canal(is) analisado(s). ${totalAjustes} ajuste(s) sugerido(s).`,
      input.messageId,
      0.85,
      false, false, undefined,
      { ajustes },
    )
  }

  requestHandoff(params: {
    destino: 'ze-host'
    contexto: string
    motivo: string
    payload: Record<string, unknown>
  }): ZcpHandoffPackage {
    return createZcpHandoff({
      origem: 'ze-analyst',
      ...params,
      zcpSecret: this.zcpSecret,
    })
  }

  private output(
    success: boolean,
    responseText: string,
    messageId: string,
    confidenceScore: number,
    needsEscalation = false,
    handoffRequired = false,
    handoffTo?: 'ze-sales' | 'ze-marketer' | 'ze-host',
    data?: unknown,
  ): ZeCognitiveOutput {
    return {
      responseId: generateId(),
      success,
      responseText,
      confidenceScore,
      needsEscalation,
      handoffRequired,
      handoffTo,
      data,
    }
  }
}
