import { Lead } from '../../../domain/lead/entities/Lead'
import { LeadStatus } from '../../../domain/lead/LeadStatus'
import { ILeadRepository, LeadFilters, LeadAggregate } from '../../../application/lead/ports/ILeadRepository'

export class InMemoryLeadRepository implements ILeadRepository {
  private leads = new Map<string, Lead>()

  async save(lead: Lead): Promise<Lead> {
    this.leads.set(lead.id, lead)
    return lead
  }

  async update(lead: Lead): Promise<Lead> {
    this.leads.set(lead.id, lead)
    return lead
  }

  async findById(id: string): Promise<Lead | null> {
    return this.leads.get(id) ?? null
  }

  async findByEmail(email: string): Promise<Lead | null> {
    for (const lead of this.leads.values()) {
      if (lead.contact.email === email) return lead
    }
    return null
  }

  async findByPhone(phone: string): Promise<Lead | null> {
    const cleaned = phone.replace(/\D/g, '')
    for (const lead of this.leads.values()) {
      if (lead.contact.phone === cleaned || lead.contact.whatsapp === cleaned) return lead
    }
    return null
  }

  async findMany(filters?: LeadFilters): Promise<Lead[]> {
    let result = Array.from(this.leads.values())
    if (filters) {
      if (filters.propertyId) result = result.filter((l) => l.propertyId === filters.propertyId)
      if (filters.status) {
        const statuses = Array.isArray(filters.status) ? filters.status : [filters.status]
        result = result.filter((l) => statuses.includes(l.funnel.status))
      }
      if (filters.source) result = result.filter((l) => l.funnel.source === filters.source)
      if (filters.minScore !== undefined) result = result.filter((l) => l.score.score >= filters.minScore!)
      if (filters.maxScore !== undefined) result = result.filter((l) => l.score.score <= filters.maxScore!)
      if (filters.city) result = result.filter((l) => l.business.city === filters.city)
      if (filters.state) result = result.filter((l) => l.business.state === filters.state)
    }
    return result
  }

  async count(filters?: LeadFilters): Promise<number> {
    const items = await this.findMany(filters)
    return items.length
  }

  async aggregate(filters?: LeadFilters): Promise<LeadAggregate> {
    const items = await this.findMany(filters)
    const total = items.length
    const avgScore = total > 0
      ? Math.round(items.reduce((s, l) => s + l.score.score, 0) / total * 100) / 100
      : 0
    const byRegionMap = new Map<string, number>()
    for (const l of items) {
      const region = l.business.region ?? l.business.state ?? 'unknown'
      byRegionMap.set(region, (byRegionMap.get(region) ?? 0) + 1)
    }
    return {
      total,
      avgScore,
      avgValidationScore: 0,
      byRegion: Array.from(byRegionMap.entries()).map(([name, count]) => ({ name, count })),
    }
  }

  async delete(id: string): Promise<void> {
    this.leads.delete(id)
  }

  clear(): void {
    this.leads.clear()
  }
}
