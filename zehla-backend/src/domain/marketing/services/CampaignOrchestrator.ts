import { Result } from '../../shared/Result'

export interface SegmentFilter {
  type: 'todos' | 'hospedes_ativos' | 'hospedes_passados' | 'leads_quentes' | 'leads_frios' | 'personalizado'
  customFilter?: Record<string, unknown>
}

export interface CampaignMessage {
  templateId: string
  variables: Record<string, string>
}

export interface ScheduledCampaign {
  id: string
  propertyId: string
  name: string
  segmentFilter: SegmentFilter
  message: CampaignMessage
  schedule: {
    startAt: Date
    endAt?: Date
    timezone: string
    sendWindowStart: string
    sendWindowEnd: string
  }
  status: 'rascunho' | 'agendada' | 'em_envio' | 'concluida' | 'cancelada'
  stats: {
    totalRecipients: number
    sent: number
    delivered: number
    failed: number
    opened: number
  }
}

export interface CampaignRecipient {
  id: string
  name: string
  phone: string
  language: string
}

export interface IMessagingService {
  sendMessage(phone: string, message: string): Promise<Result<{ messageId: string }, Error>>
  sendTemplate(phone: string, templateId: string, variables: Record<string, string>): Promise<Result<{ messageId: string }, Error>>
}

export type CampanhaExecucaoStatus = 'agendada' | 'em_envio' | 'concluida' | 'cancelada'
export type CampanhaExecucaoTransicoes = Record<CampanhaExecucaoStatus, CampanhaExecucaoStatus[]>

const STATUS_TRANSICOES: CampanhaExecucaoTransicoes = {
  agendada: ['em_envio', 'cancelada'],
  em_envio: ['concluida', 'cancelada'],
  concluida: [],
  cancelada: [],
}

export class CampaignOrchestrator {
  private readonly SEND_WINDOW_START = 9
  private readonly SEND_WINDOW_END = 20

  validateSchedule(schedule: ScheduledCampaign['schedule']): Result<void, Error> {
    if (!schedule.startAt || isNaN(schedule.startAt.getTime())) {
      return Result.fail(new Error('Data de início é obrigatória'))
    }
    if (schedule.startAt < new Date()) {
      return Result.fail(new Error('Data de início não pode ser no passado'))
    }
    if (!schedule.sendWindowStart || !schedule.sendWindowEnd) {
      return Result.fail(new Error('Janela de envio é obrigatória'))
    }
    const [startH, startM] = schedule.sendWindowStart.split(':').map(Number)
    const [endH, endM] = schedule.sendWindowEnd.split(':').map(Number)
    if (isNaN(startH) || isNaN(endH)) {
      return Result.fail(new Error('Formato de janela de envio inválido'))
    }
    if (startH < this.SEND_WINDOW_START || endH > this.SEND_WINDOW_END) {
      return Result.fail(new Error(`Janela de envio deve estar entre ${this.SEND_WINDOW_START}:00 e ${this.SEND_WINDOW_END}:00`))
    }
    return Result.ok(undefined)
  }

  validateSegment(segment: SegmentFilter): Result<void, Error> {
    if (!segment.type) {
      return Result.fail(new Error('Tipo de segmento é obrigatório'))
    }
    const validTypes: SegmentFilter['type'][] = ['todos', 'hospedes_ativos', 'hospedes_passados', 'leads_quentes', 'leads_frios', 'personalizado']
    if (!validTypes.includes(segment.type)) {
      return Result.fail(new Error(`Tipo de segmento inválido: ${segment.type}`))
    }
    if ((segment.type === 'personalizado' && !segment.customFilter)) {
      return Result.fail(new Error('Segmento personalizado requer filtro customizado'))
    }
    return Result.ok(undefined)
  }

  canTransition(current: CampanhaExecucaoStatus, next: CampanhaExecucaoStatus): Result<void, Error> {
    const allowed = STATUS_TRANSICOES[current]
    if (!allowed || !allowed.includes(next)) {
      return Result.fail(new Error(`Transição inválida: ${current} -> ${next}`))
    }
    return Result.ok(undefined)
  }

  estimateRecipients(segment: SegmentFilter, totalAvailable: number): number {
    switch (segment.type) {
      case 'todos': return totalAvailable
      case 'hospedes_ativos': return Math.round(totalAvailable * 0.3)
      case 'hospedes_passados': return Math.round(totalAvailable * 0.5)
      case 'leads_quentes': return Math.round(totalAvailable * 0.15)
      case 'leads_frios': return Math.round(totalAvailable * 0.35)
      case 'personalizado': return Math.round(totalAvailable * 0.2)
      default: return 0
    }
  }

  calculateBatchSize(totalRecipients: number): number {
    if (totalRecipients <= 100) return totalRecipients
    if (totalRecipients <= 1000) return 100
    if (totalRecipients <= 10000) return 200
    return 500
  }

  estimateDurationMinutes(totalRecipients: number): number {
    const batchSize = this.calculateBatchSize(totalRecipients)
    const batches = Math.ceil(totalRecipients / batchSize)
    return batches * 2
  }
}
