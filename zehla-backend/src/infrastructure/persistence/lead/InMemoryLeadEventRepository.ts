import { LeadEvent } from '../../../domain/lead/entities/LeadEvent'
import { LeadEventType } from '../../../domain/lead/LeadEventType'
import { ILeadEventRepository } from '../../../application/lead/ports/ILeadEventRepository'

export class InMemoryLeadEventRepository implements ILeadEventRepository {
  private events = new Map<string, LeadEvent>()

  async save(event: LeadEvent): Promise<LeadEvent> {
    this.events.set(event.id, event)
    return event
  }

  async findByLeadId(leadId: string): Promise<LeadEvent[]> {
    return Array.from(this.events.values()).filter((e) => e.leadId === leadId)
  }

  async findByDedupHash(hash: string): Promise<LeadEvent | null> {
    for (const event of this.events.values()) {
      if (event.dedupHash === hash) return event
    }
    return null
  }

  async countByLeadId(leadId: string): Promise<number> {
    return Array.from(this.events.values()).filter((e) => e.leadId === leadId).length
  }

  async countByTypeAndEmail(_email: string, _type: LeadEventType, _since: Date): Promise<number> {
    return 0
  }

  clear(): void {
    this.events.clear()
  }
}
