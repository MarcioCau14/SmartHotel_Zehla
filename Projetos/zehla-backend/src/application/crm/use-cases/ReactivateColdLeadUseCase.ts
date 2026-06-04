import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { FarmerReactivationService } from '../../../domain/crm/services/FarmerReactivationService'
import { ReservationSnapshot } from '../../../domain/crm/models/ReservationSnapshot'
import { LeadProfile } from '../../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../../domain/crm/models/InteractionRecord'
import { CRMPipelineStage } from '../../../domain/crm/models/CRMPipelineStage'
import { ReactivationCandidate } from '../../../domain/crm/models/ReactivationCandidate'
import { waitGaussian } from '../../../shared/GaussianDelay'
import type { IWhatsAppPort } from '../../shared/ports/IWhatsAppPort'

export type DelayFunction = () => Promise<void>

export interface ReactivationOutput {
  readonly totalCandidates: number
  readonly sentMessages: number
  readonly skippedNoFutureReservations: number
  readonly errors: ReadonlyArray<{ leadId: string; error: string }>
}

export class ReactivateColdLeadUseCase {
  constructor(
    private readonly leadRepo: ICRMRepositoryPort,
    private readonly whatsApp: IWhatsAppPort,
    private readonly farmerService: FarmerReactivationService,
    private readonly delayFn: DelayFunction = () => waitGaussian(5000, 45000),
  ) {}

  async execute(
    leads: LeadProfile[],
    currentDate: Date,
  ): Promise<Result<ReactivationOutput, Error>> {
    if (!leads || leads.length === 0) {
      return Result.fail(new Error('Nenhum lead fornecido para reativação'))
    }

    let totalCandidates = 0
    let sentMessages = 0
    let skippedNoFutureReservations = 0
    const errors: Array<{ leadId: string; error: string }> = []

    for (const lead of leads) {
      try {
        const interacoesResult = await this.leadRepo.listarInteracoesPorLead(lead.id)
        if (interacoesResult.isFail) continue

        const reservas = this._reservationsFromInteractions(interacoesResult.value, lead.id)

        const candidateResult = this.farmerService.execute(lead, reservas, currentDate)
        if (candidateResult.isFail) continue

        const candidate = candidateResult.value
        if (!candidate) {
          skippedNoFutureReservations++
          continue
        }

        totalCandidates++

        await this.delayFn()

        const msg = this._buildReactivationMessage(lead.nome, candidate)
        const whatsResult = await this.whatsApp.sendText({ to: lead.telefone, content: msg })
        if (!whatsResult.success) {
          errors.push({ leadId: lead.id, error: whatsResult.error ?? 'WHATSAPP_FALHA' })
          continue
        }

        sentMessages++

        const interactionRecord = InteractionRecord.create({
          id: `reactivation_${lead.id}_${currentDate.getTime()}`,
          leadId: lead.id,
          canal: 'whatsapp',
          timestamp: currentDate,
          sentimentScore: 0,
          tokenCost: 0,
          outcome: 'PENDING',
          resumo: `Reativação Farmer IA enviada. ${candidate.daysSinceCheckout} dias desde último checkout.`,
        })

        if (interactionRecord.isOk) {
          await this.leadRepo.registrarInteracao(interactionRecord.value)
        }
      } catch (err) {
        errors.push({ leadId: lead.id, error: `ERRO: ${(err as Error).message}` })
      }
    }

    return Result.ok({
      totalCandidates,
      sentMessages,
      skippedNoFutureReservations,
      errors: Object.freeze(errors),
    })
  }

  private _reservationsFromInteractions(
    interactions: InteractionRecord[],
    leadId: string,
  ): ReservationSnapshot[] {
    const snapshots: ReservationSnapshot[] = []
    for (const i of interactions) {
      if (i.canal !== 'whatsapp' && i.canal !== 'website' && i.canal !== 'instagram') continue
      const completed = /reserva|cadastro|checkout|confirmado|booking/i.test(i.resumo ?? '')
      const result = ReservationSnapshot.create({
        id: `res_${i.id}`,
        leadId,
        checkoutDate: i.timestamp,
        status: completed ? 'COMPLETED' : 'FUTURE',
        propriedadeId: 'default',
      })
      if (result.isOk) snapshots.push(result.value)
    }
    return snapshots
  }

  private _buildReactivationMessage(nome: string, candidate: ReactivationCandidate): string {
    return `Olá ${nome}! 👋\n\nFaz ${candidate.daysSinceCheckout} dias que você não nos visita. A pousada está com novidades para a nova estação! Gostaria de saber como você está e se gostaria de receber uma oferta especial para o seu próximo fim de semana?`
  }
}
