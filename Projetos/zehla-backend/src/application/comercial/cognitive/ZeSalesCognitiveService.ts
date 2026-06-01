import { Result } from '../../../shared/Result'
import { ILeadPort } from '../ports/ILeadPort'
import { IPropostaPort } from '../ports/IPropostaPort'
import { IPagamentoPort } from '../ports/IPagamentoPort'
import { IConversaoPort } from '../ports/IConversaoPort'
import { CapturarLeadUseCase } from '../use-cases/CapturarLeadUseCase'
import { QualificarLeadUseCase } from '../use-cases/QualificarLeadUseCase'
import { CriarPropostaUseCase } from '../use-cases/CriarPropostaUseCase'
import { AceitarPropostaUseCase } from '../use-cases/AceitarPropostaUseCase'
import { SugerirDescontoUseCase } from '../use-cases/SugerirDescontoUseCase'
import { ConfirmarPagamentoUseCase } from '../use-cases/ConfirmarPagamentoUseCase'
import { ZeSalesInput, ZeCognitiveOutput, ZcpHandoffPackage, createZcpHandoff, translateError } from './ZeCognitiveTypes'

function generateId(): string {
  return `zs-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export class ZeSalesCognitiveService {
  constructor(
    private readonly leadPort: ILeadPort,
    private readonly propostaPort: IPropostaPort,
    private readonly pagamentoPort: IPagamentoPort,
    private readonly conversaoPort: IConversaoPort,
    private readonly capturarLeadUseCase: CapturarLeadUseCase,
    private readonly qualificarLeadUseCase: QualificarLeadUseCase,
    private readonly criarPropostaUseCase: CriarPropostaUseCase,
    private readonly aceitarPropostaUseCase: AceitarPropostaUseCase,
    private readonly sugerirDescontoUseCase: SugerirDescontoUseCase,
    private readonly confirmarPagamentoUseCase: ConfirmarPagamentoUseCase,
    private readonly zcpSecret: string,
  ) {}

  async processIntent(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    try {
      switch (input.intent) {
        case 'CAPTURAR_LEAD':
          return await this.handleCapturarLead(input)
        case 'QUALIFICAR_LEAD':
          return await this.handleQualificarLead(input)
        case 'CRIAR_PROPOSTA':
          return await this.handleCriarProposta(input)
        case 'ACEITAR_PROPOSTA':
          return await this.handleAceitarProposta(input)
        case 'SUGERIR_DESCONTO':
          return await this.handleSugerirDesconto(input)
        case 'CONFIRMAR_PAGAMENTO':
          return await this.handleConfirmarPagamento(input)
        case 'CONSULTAR_CONVERSAO':
          return await this.handleConsultarConversao(input)
        case 'CONSULTAR_PAGAMENTO':
          return await this.handleConsultarPagamento(input)
        case 'LISTAR_LEADS':
          return await this.handleListarLeads(input)
        default:
          return this.output(false, 'Intenção não reconhecida pelo Zé-Sales.', input.messageId, 0.3)
      }
    } catch {
      return this.output(false, 'Erro interno no Zé-Sales. Operação cancelada.', input.messageId, 0.0, true)
    }
  }

  private async handleCapturarLead(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { canal, nome, email, telefone, documento, origemUrl, tags } = input.payload as any
    if (!canal) {
      return this.output(false, 'Preciso do canal de origem para capturar o lead.', input.messageId, 0.4)
    }
    const result = await this.capturarLeadUseCase.execute({
      canal: canal as string,
      propriedadeId: input.propriedadeId,
      nome: nome as string | undefined,
      email: email as string | undefined,
      telefone: telefone as string | undefined,
      documento: documento as string | undefined,
      origemUrl: origemUrl as string | undefined,
      tags: (tags as string[]) || undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Lead ${result.value.nome || 'sem nome'} capturado com sucesso! ID: ${result.value.id}.`,
      input.messageId,
      0.95,
      false,
      false,
      undefined,
      { leadId: result.value.id, status: result.value.status },
    )
  }

  private async handleQualificarLead(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { leadId } = input.payload as any
    if (!leadId) {
      return this.output(false, 'Preciso do ID do lead para qualificar.', input.messageId, 0.4)
    }
    const result = await this.qualificarLeadUseCase.execute(leadId as string)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Lead ${result.value.nome} qualificado com sucesso! Score: ${result.value.score?.valor || 'N/A'}.`,
      input.messageId,
      0.9,
    )
  }

  private async handleCriarProposta(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { leadId, pacoteId, dataCheckIn, dataCheckOut, quantidadeHospedes, observacoes } = input.payload as any
    if (!leadId || !pacoteId || !dataCheckIn || !dataCheckOut) {
      return this.output(false, 'Preciso do lead, pacote, check-in e check-out para criar a proposta.', input.messageId, 0.4)
    }
    const result = await this.criarPropostaUseCase.execute({
      leadId: leadId as string,
      propriedadeId: input.propriedadeId,
      pacoteId: pacoteId as string,
      dataCheckIn: new Date(dataCheckIn as string),
      dataCheckOut: new Date(dataCheckOut as string),
      quantidadeHospedes: (quantidadeHospedes as number) || 1,
      observacoes: observacoes as string | undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Proposta criada com sucesso! ID: ${result.value.id}. Status: ${result.value.status}.`,
      input.messageId,
      0.95,
      false,
      false,
      undefined,
      { propostaId: result.value.id, status: result.value.status },
    )
  }

  private async handleAceitarProposta(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { propostaId } = input.payload as any
    if (!propostaId) {
      return this.output(false, 'Preciso do ID da proposta para aceitar.', input.messageId, 0.4)
    }
    const result = await this.aceitarPropostaUseCase.execute(propostaId as string, input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Proposta ${result.value.id} aceita! Sinal de ${result.value.valorSinal ? `R$ ${(result.value.valorSinal.centavos / 100).toFixed(2)}` : 'calculado'} gerado para pagamento.`,
      input.messageId,
      0.95,
      false,
      false,
      undefined,
      { propostaId: result.value.id, status: result.value.status, sinal: result.value.valorSinal?.centavos },
    )
  }

  private async handleSugerirDesconto(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { propostaId } = input.payload as any
    if (!propostaId) {
      return this.output(false, 'Preciso do ID da proposta para sugerir desconto.', input.messageId, 0.4)
    }
    const result = await this.sugerirDescontoUseCase.execute(propostaId as string, input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    const { descontoSugerido, motivo } = result.value
    return this.output(
      true,
      `Desconto sugerido: R$ ${(descontoSugerido.centavos / 100).toFixed(2)}. Motivo: ${motivo}`,
      input.messageId,
      0.85,
    )
  }

  private async handleConfirmarPagamento(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { pagamentoId } = input.payload as any
    if (!pagamentoId) {
      return this.output(false, 'Preciso do ID do pagamento para confirmar.', input.messageId, 0.4)
    }
    const result = await this.confirmarPagamentoUseCase.execute(pagamentoId as string, input.propriedadeId)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3, true)
    }
    return this.output(
      true,
      `Pagamento ${result.value.id} confirmado! Conversão registrada com sucesso.`,
      input.messageId,
      0.95,
    )
  }

  private async handleConsultarConversao(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { leadId, propostaId } = input.payload as any
    if (!leadId && !propostaId) {
      return this.output(false, 'Preciso do ID do lead ou da proposta para consultar.', input.messageId, 0.4)
    }
    const filtros: any = { propriedadeId: input.propriedadeId }
    if (leadId) filtros.leadId = leadId as string
    if (propostaId) filtros.propostaId = propostaId as string
    const result = await this.conversaoPort.listarConversoesPorStatus(input.propriedadeId, ['pendente', 'confirmada', 'cancelada'], 10)
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3)
    }
    return this.output(
      true,
      `Encontradas ${result.value.length} conversão(ões).`,
      input.messageId,
      0.85,
      false,
      false,
      undefined,
      { conversoes: result.value.map(c => ({ id: c.id, status: c.status, leadId: c.leadId })) },
    )
  }

  private async handleConsultarPagamento(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { pagamentoId } = input.payload as any
    if (!pagamentoId) {
      return this.output(false, 'Preciso do ID do pagamento para consultar.', input.messageId, 0.4)
    }
    const result = await this.pagamentoPort.buscarPagamentoPorId(pagamentoId as string, input.propriedadeId)
    if (result.isFail || !result.value) {
      return this.output(false, translateError(result.error || new Error('PAGAMENTO_NOT_FOUND')), input.messageId, 0.3)
    }
    const p = result.value
    return this.output(
      true,
      `Pagamento ${p.id}: ${p.status}. Valor: R$ ${(p.valor.centavos / 100).toFixed(2)}.`,
      input.messageId,
      0.9,
      false,
      false,
      undefined,
      { id: p.id, status: p.status, valor: p.valor.centavos },
    )
  }

  private async handleListarLeads(input: ZeSalesInput): Promise<ZeCognitiveOutput> {
    const { status, canal } = input.payload as any
    const result = await this.leadPort.listarLeadsPorPropriedade(input.propriedadeId, {
      status: status as string[] | undefined,
      canal: canal as string | undefined,
    })
    if (result.isFail) {
      return this.output(false, translateError(result.error), input.messageId, 0.3)
    }
    return this.output(
      true,
      `${result.value.length} lead(s) encontrado(s).`,
      input.messageId,
      0.85,
      false,
      false,
      undefined,
      { leads: result.value.map(l => ({ id: l.id, nome: l.nome, status: l.status, score: l.score?.value })) },
    )
  }

  requestHandoff(params: {
    destino: 'ze-marketer' | 'ze-host'
    leadId?: string
    propostaId?: string
    contexto: string
    motivo: string
    payload: Record<string, unknown>
  }): ZcpHandoffPackage {
    return createZcpHandoff({
      origem: 'ze-sales',
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
