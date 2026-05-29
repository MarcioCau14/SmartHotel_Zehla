import { BaseHttpAdapter } from './BaseHttpAdapter'
import { Result } from '../../shared/Result'

export interface CognitiveOutput {
  responseId: string
  success: boolean
  responseText: string
  confidenceScore: number
  needsEscalation: boolean
  handoffRequired: boolean
  handoffTo?: string
  data?: any
}

export class SalesServiceAdapter extends BaseHttpAdapter {
  async processarIntentLeads(intent: string, payload?: any): Promise<Result<CognitiveOutput, Error>> {
    return this.post<CognitiveOutput>('/api/comercial/leads', {
      intent,
      payload: payload || {},
    })
  }

  async processarIntentPropostas(intent: string, payload?: any): Promise<Result<CognitiveOutput, Error>> {
    return this.post<CognitiveOutput>('/api/comercial/propostas', {
      intent,
      payload: payload || {},
    })
  }

  async capturarLead(dados: {
    canal: string
    nome?: string
    email?: string
    telefone?: string
  }): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentLeads('CAPTURAR_LEAD', dados)
  }

  async qualificarLead(leadId: string): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentLeads('QUALIFICAR_LEAD', { leadId })
  }

  async listarLeads(filtros?: { status?: string[]; canal?: string }): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentLeads('LISTAR_LEADS', filtros)
  }

  async criarProposta(dados: {
    leadId: string
    pacoteId: string
    dataCheckIn: string
    dataCheckOut: string
    quantidadeHospedes?: number
    observacoes?: string
  }): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentPropostas('CRIAR_PROPOSTA', dados)
  }

  async aceitarProposta(propostaId: string): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentPropostas('ACEITAR_PROPOSTA', { propostaId })
  }

  async sugerirDesconto(propostaId: string): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentPropostas('SUGERIR_DESCONTO', { propostaId })
  }

  async confirmarPagamento(pagamentoId: string): Promise<Result<CognitiveOutput, Error>> {
    return this.processarIntentPropostas('CONFIRMAR_PAGAMENTO', { pagamentoId })
  }
}
