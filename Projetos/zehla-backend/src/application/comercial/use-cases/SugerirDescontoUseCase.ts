import { IPropostaPort } from '../../../application/comercial/ports/IPropostaPort'
import { IPacotePort } from '../../../application/comercial/ports/IPacotePort'
import { ILeadPort } from '../../../application/comercial/ports/ILeadPort'
import { Money } from '../../../domain/comercial/value-objects/Money'
import { Result } from '../../../shared/Result'
import { Proposta } from '../../../domain/comercial/entities/Proposta'
import { Pacote } from '../../../domain/comercial/entities/Pacote'
import { createLogger } from '../../../infrastructure/observability/Logger'
import { getTraceId, getTenantId } from '../../../infrastructure/observability/RequestLogger'

export class SugerirDescontoUseCase {
  constructor(
    private readonly propostaPort: IPropostaPort,
    private readonly pacotePort: IPacotePort,
    private readonly leadPort: ILeadPort
  ) {}

  private readonly log = createLogger()

  async execute(propostaId: string, propriedadeId: string): Promise<Result<{ proposta: Proposta; descontoSugerido: Money; motivo: string }, Error>> {
    try {
      // 1. Buscar a proposta
      const propostaResult = await this.propostaPort.buscarPropostaPorId(propostaId, propriedadeId)
      if (propostaResult.isFail) {
        this.log.warn({ error: propostaResult.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: proposta não encontrada')
        return Result.fail(propostaResult.error)
      }
      
      const proposta = propostaResult.value
      if (!proposta) {
        this.log.warn({ error: 'Proposal not found', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: proposta não encontrada')
        return Result.fail(new Error('Proposal not found'))
      }
      
      // Regra de negócio: Só é possível sugerir desconto para propostas enviadas, vistas ou em negociação
      if (!(proposta.ehEnviada || proposta.ehVista || proposta.ehNegociacao)) {
        this.log.warn({ error: 'Discount can only be suggested for sent, viewed, or negotiated proposals', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: proposta em status inválido para desconto')
        return Result.fail(new Error('Discount can only be suggested for sent, viewed, or negotiated proposals'))
      }
      
      // 2. Buscar o pacote associado
      const pacoteResult = await this.pacotePort.buscarPacotePorId(proposta.pacoteId, proposta.propriedadeId)
      if (pacoteResult.isFail) {
        this.log.warn({ error: pacoteResult.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: pacote associado não encontrado')
        return Result.fail(pacoteResult.error)
      }
      
      const pacote = pacoteResult.value
      if (!pacote) {
        this.log.warn({ error: 'Associated package not found', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: pacote associado não encontrado')
        return Result.fail(new Error('Associated package not found'))
      }

      // 3. Buscar o lead associado para verificar tempo de resposta
      const leadResult = await this.leadPort.buscarLeadPorId(proposta.leadId, proposta.propriedadeId)
      if (leadResult.isFail) {
        this.log.warn({ error: leadResult.error.message, traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: lead associado não encontrado')
        return Result.fail(leadResult.error)
      }
      
      const lead = leadResult.value
      if (!lead) {
        this.log.warn({ error: 'Associated lead not found', traceId: getTraceId(), tenantId: getTenantId() }, 'Regra de negócio violada: lead associado não encontrado')
        return Result.fail(new Error('Associated lead not found'))
      }
      
      // 4. Calcular desconto sugerido baseado em regras de negócio de Yield
      let descontoSugerido: Money = Money.zero()
      let motivo = 'No discount applicable based on current rules'
      let percentualDesconto = 0
      
      // Regra A: Yield por Ocupação do Hotel (Simulado de forma determinística por quantidade de hóspedes)
      // - 1 hóspede: Simula ocupação de 25% (<30%) -> 20% desconto
      // - 2 hóspedes: Simula ocupação de 45% (<60%) -> 10% desconto
      // - 3+ hóspedes: Simula ocupação de 75% (>=60%) -> 0% desconto
      let ocupacaoSimulada = 75
      if (proposta.quantidadeHospedes === 1) {
        ocupacaoSimulada = 25
      } else if (proposta.quantidadeHospedes === 2) {
        ocupacaoSimulada = 45
      }
      
      if (ocupacaoSimulada < 30) {
        percentualDesconto = 20
        motivo = `Low property occupancy (${ocupacaoSimulada}%) qualifies for 20% yield discount`
      } else if (ocupacaoSimulada < 60) {
        percentualDesconto = 10
        motivo = `Moderate property occupancy (${ocupacaoSimulada}%) qualifies for 10% yield discount`
      }
      
      // Regra B: Reengajamento por tempo de abandono do Lead (inativo por 7+ dias)
      if (lead.ultimaInteracao) {
        const agora = new Date()
        const diffTime = Math.abs(agora.getTime() - lead.ultimaInteracao.getTime())
        const diasSemResposta = Math.floor(diffTime / (1000 * 60 * 60 * 24))
        
        if (diasSemResposta >= 7) {
          // Desconto de reengajamento de 15% (se for maior que o desconto de ocupação)
          if (15 > percentualDesconto) {
            percentualDesconto = 15
            motivo = `Lead has been inactive without response for ${diasSemResposta} days. 15% discount suggested for re-engagement.`
          }
        }
      }
      
      // Aplicar o percentual calculado sobre o valor total da proposta
      if (percentualDesconto > 0 && proposta.valorTotal) {
        const pctResult = proposta.valorTotal.percentage(percentualDesconto)
        if (pctResult.isOk) {
          descontoSugerido = pctResult.value
        }
      }
      
      // Política de Negócio: Garantir que o desconto não exceda 20% do total
      if (proposta.valorTotal && descontoSugerido.centavos > proposta.valorTotal.centavos * 0.20) {
        const pctResult = proposta.valorTotal.percentage(20)
        if (pctResult.isOk) {
          descontoSugerido = pctResult.value
          motivo = 'Discount capped at 20% maximum policy limit'
        }
      }
      
      return Result.ok({
        proposta,
        descontoSugerido,
        motivo
      })
    } catch (error) {
      this.log.error({ err: error, traceId: getTraceId(), tenantId: getTenantId() }, 'Erro de infraestrutura: falha ao sugerir desconto')
      return Result.fail(error instanceof Error ? error : new Error('Unexpected error suggesting discount'))
    }
  }
}