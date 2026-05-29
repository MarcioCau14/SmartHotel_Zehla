import { BaseHttpAdapter } from './BaseHttpAdapter'
import { Result } from '../../shared/Result'

export interface RevenueResponse {
  responseId: string
  success: boolean
  responseText: string
  confidenceScore: number
  needsEscalation: boolean
  handoffRequired: boolean
  data?: any
}

export class RevenueServiceAdapter extends BaseHttpAdapter {
  async processarIntencao(intent: string, payload?: any): Promise<Result<RevenueResponse, Error>> {
    return this.post<RevenueResponse>('/api/revenue/tarifas', {
      intent,
      payload: payload || {},
    })
  }

  async validarBreakEven(regraTarifariaId: string, valorPretendido: number): Promise<Result<RevenueResponse, Error>> {
    return this.processarIntencao('VALIDAR_BREAK_EVEN', {
      regraTarifariaId,
      valorPretendido,
    })
  }

  async consultarMetricas(dataInicio: string, dataFim: string): Promise<Result<RevenueResponse, Error>> {
    return this.processarIntencao('CONSULTAR_METRICAS', {
      dataInicio,
      dataFim,
    })
  }
}
