import { Property } from '../../../domain/property/entities/Property'
import { PropertyStatus, Plan } from '../../../domain/property/enums'

export interface PropertyFilters {
  status?: PropertyStatus
  plan?: Plan
  isTrial?: boolean
  isCanary?: boolean
  search?: string
  limit?: number
  offset?: number
}

export interface IPropertyRepository {
  save(property: Property): Promise<Property>
  findById(id: string): Promise<Property | null>
  findBySlug(slug: string): Promise<Property | null>
  findByRegistrationNumber(registrationNumber: string): Promise<Property | null>
  findByStatus(status: PropertyStatus): Promise<Property[]>
  findExpiringTrials(): Promise<Property[]>
  findExpiredTrials(): Promise<Property[]>
  findCadasturExpiring(days?: number): Promise<Property[]>
  findCadasturExpired(): Promise<Property[]>
  findSuspended(): Promise<Property[]>
  count(filters?: PropertyFilters): Promise<number>
  existsBySlug(slug: string): Promise<boolean>
}
