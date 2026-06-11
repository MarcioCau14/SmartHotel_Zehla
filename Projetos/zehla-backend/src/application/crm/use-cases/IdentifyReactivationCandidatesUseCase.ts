import { Result } from '../../../shared/Result'
import { ICRMRepositoryPort } from '../../../domain/crm/ports/ICRMRepositoryPort'
import { FarmerReactivationService } from '../../../domain/crm/services/FarmerReactivationService'
import { ReservationSnapshot } from '../../../domain/crm/models/ReservationSnapshot'
import { ReactivationCandidate } from '../../../domain/crm/models/ReactivationCandidate'
import { LeadProfile } from '../../../domain/crm/models/LeadProfile'
import { InteractionRecord } from '../../../domain/crm/models/InteractionRecord'
import { ConsentimentoLGPD } from '../../../domain/crm/models/MarketIntelligence'

export interface IdentifyReactivationCandidatesInput {
  readonly propriedadeId: string
  readonly currentDate: Date
  readonly leads: ReadonlyArray<LeadProfile>
  readonly consentimentoPorLead: ReadonlyMap<string, ConsentimentoLGPD>
}

export class IdentifyReactivationCandidatesUseCase {
  constructor(
    private readonly leadRepo: ICRMRepositoryPort,
    private readonly farmerService: FarmerReactivationService,
  ) {}

  async execute(input: IdentifyReactivationCandidatesInput): Promise<Result<readonly ReactivationCandidate[], Error>> {
    if (!input.propriedadeId || input.propriedadeId.trim().length === 0) {
      return Result.fail(new Error('ID da propriedade é obrigatório'))
    }
    if (!input.leads || input.leads.length === 0) {
      return Result.ok([])
    }

    const candidates: ReactivationCandidate[] = []

    for (const lead of input.leads) {
      if (lead.propriedadeId !== input.propriedadeId) continue

      const interacoesResult = await this.leadRepo.listarInteracoesPorLead(lead.id)
      if (interacoesResult.isFail) continue

      const reservas = this._reservationsFromInteractions(interacoesResult.value, lead.id)
      const consentimento = input.consentimentoPorLead.get(lead.id) ?? 'consentimento'
      const candidateResult = this.farmerService.execute(lead, reservas, input.currentDate, consentimento)
      if (candidateResult.isFail) continue

      const candidate = candidateResult.value
      if (candidate) {
        candidates.push(candidate)
      }
    }

    return Result.ok(Object.freeze(candidates))
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
}
