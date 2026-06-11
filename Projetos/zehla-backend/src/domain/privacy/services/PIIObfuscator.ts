import { LeadProfile } from '../../crm/models/LeadProfile'
import { Result } from '../../../shared/Result'
import { IPIIHasherPort } from '../ports/IPIIHasherPort'

export class PIIObfuscator {
  constructor(private readonly hasher: IPIIHasherPort) {}

  obfuscateList(leads: LeadProfile[]): Result<LeadProfile[], Error> {
    const results: LeadProfile[] = []
    for (const lead of leads) {
      const r = this.obfuscate(lead)
      if (r.isFail) return Result.fail(r.error)
      results.push(r.value!)
    }
    return Result.ok(results)
  }

  obfuscate(lead: LeadProfile): Result<LeadProfile, Error> {
    const nomeHash = this.hasher.hash(lead.nome)
    const telefoneHash = this.hasher.hash(lead.telefone)
    const emailHash = lead.email ? this.hasher.hash(lead.email) : undefined

    return LeadProfile.create({
      id: lead.id,
      nome: nomeHash,
      telefone: telefoneHash,
      email: emailHash,
      canalOrigem: lead.canalOrigem,
      ltvScore: lead.ltvScore,
      stage: lead.stage,
      createdAt: lead.createdAt,
      propriedadeId: lead.propriedadeId,
      persona: lead.persona,
      totalSpentUsd: lead.totalSpentUsd,
      staysCount: lead.staysCount,
      lastInteractionAt: lead.lastInteractionAt,
      bookingValueUsd: lead.bookingValueUsd,
      assignedCloserId: lead.assignedCloserId,
      tags: [...lead.tags],
      updatedAt: new Date(),
    })
  }
}
