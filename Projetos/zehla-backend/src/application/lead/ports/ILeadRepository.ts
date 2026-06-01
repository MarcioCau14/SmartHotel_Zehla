import { Lead } from '../../../domain/lead/entities/Lead'
import { LeadStatus } from '../../../domain/lead/LeadStatus'

export interface LeadFilters {
  propertyId?: string
  status?: LeadStatus | LeadStatus[]
  source?: string
  minScore?: number
  maxScore?: number
  cluster?: string
  city?: string
  state?: string
  region?: string
  search?: string
  limit?: number
  offset?: number
}

export interface LeadAggregate {
  total: number
  avgScore: number
  avgValidationScore: number
  byRegion: Array<{ name: string; count: number }>
}

export interface ILeadRepository {
  save(lead: Lead): Promise<Lead>
  update(lead: Lead): Promise<Lead>
  findById(id: string): Promise<Lead | null>
  findByEmail(email: string): Promise<Lead | null>
  findByPhone(phone: string): Promise<Lead | null>
  findMany(filters?: LeadFilters): Promise<Lead[]>
  count(filters?: LeadFilters): Promise<number>
  aggregate(filters?: LeadFilters): Promise<LeadAggregate>
  delete(id: string): Promise<void>
}
