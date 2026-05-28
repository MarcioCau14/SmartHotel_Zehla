import { LeadEvent } from '../../../domain/lead/entities/LeadEvent'
import { LeadEventType } from '../../../domain/lead/LeadEventType'

export interface ILeadEventRepository {
  save(event: LeadEvent): Promise<LeadEvent>
  findByLeadId(leadId: string): Promise<LeadEvent[]>
  findByDedupHash(hash: string): Promise<LeadEvent | null>
  countByLeadId(leadId: string): Promise<number>
  countByTypeAndEmail(email: string, type: LeadEventType, since: Date): Promise<number>
}
