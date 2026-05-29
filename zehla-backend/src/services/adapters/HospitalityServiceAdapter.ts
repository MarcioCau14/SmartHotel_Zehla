import { BaseHttpAdapter } from './BaseHttpAdapter'
import { Result } from '../../shared/Result'

export interface ConciergeResponse {
  responseId: string
  success: boolean
  responseText: string
  confidenceScore: number
  needsEscalation: boolean
  handoffRequired: boolean
}

export class HospitalityServiceAdapter extends BaseHttpAdapter {
  async processarIntencao(intent: string, payload?: any): Promise<Result<ConciergeResponse, Error>> {
    return this.post<ConciergeResponse>('/api/hospitalidade/concierge', {
      intent,
      payload: payload || {},
    })
  }

  async consultarServicos(): Promise<Result<ConciergeResponse, Error>> {
    return this.processarIntencao('CONSULTAR_SERVICOS')
  }
}
