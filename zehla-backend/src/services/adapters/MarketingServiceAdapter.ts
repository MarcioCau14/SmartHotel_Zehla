import { BaseHttpAdapter } from './BaseHttpAdapter'
import { Result } from '../../shared/Result'

export interface MarketingResponse {
  dados?: any
  error?: string
  success?: boolean
  handoff?: any
}

export class MarketingServiceAdapter extends BaseHttpAdapter {
  async processarIntentCampanhas(intent: string, params?: any): Promise<Result<MarketingResponse, Error>> {
    return this.post<MarketingResponse>('/api/marketing/campanhas', {
      intent,
      params: params || {},
    })
  }

  async processarIntentReviews(intent: string, params?: any): Promise<Result<MarketingResponse, Error>> {
    return this.post<MarketingResponse>('/api/marketing/reviews', {
      intent,
      params: params || {},
    })
  }

  async agendarPost(dados: {
    canal: string
    tipo: string
    texto: string
    tom: string
    midias?: string[]
    dataAgendamento?: string
  }): Promise<Result<MarketingResponse, Error>> {
    return this.processarIntentCampanhas('AGENDAR_POST', dados)
  }

  async criarCampanha(dados: {
    nome: string
    publicoAlvo: string
    tipo: string
    textoConteudo: string
    tom: string
    dataInicio: string
    dataFim: string
    possuiPromiseFinanceira?: boolean
    promiseFinanceiraValidada?: boolean
  }): Promise<Result<MarketingResponse, Error>> {
    return this.processarIntentCampanhas('CRIAR_CAMPANHA_REMARKETING', dados)
  }

  async analisarSentimento(reviewId: string): Promise<Result<MarketingResponse, Error>> {
    return this.processarIntentReviews('ANALISAR_SENTIMENTO_REVIEW', { reviewId })
  }

  async responderReview(reviewId: string, textoResposta: string, tom: string): Promise<Result<MarketingResponse, Error>> {
    return this.processarIntentReviews('RESPONDER_REVIEW', {
      reviewId,
      textoResposta,
      tom,
    })
  }
}
