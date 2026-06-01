import { Property } from '../../../domain/property/entities/Property'
import { PropertyStatus, Plan } from '../../../domain/property/enums'
import { IPropertyRepository, PropertyFilters } from '../../../application/property/ports/IPropertyRepository'

export class InMemoryPropertyRepository implements IPropertyRepository {
  private properties = new Map<string, Property>()

  async save(property: Property): Promise<Property> {
    this.properties.set(property.id, property)
    return property
  }

  async findById(id: string): Promise<Property | null> {
    return this.properties.get(id) ?? null
  }

  async findBySlug(slug: string): Promise<Property | null> {
    for (const prop of this.properties.values()) {
      if (prop.slug === slug) return prop
    }
    return null
  }

  async findByRegistrationNumber(registrationNumber: string): Promise<Property | null> {
    for (const prop of this.properties.values()) {
      if (prop.registrationNumber.value === registrationNumber) return prop
    }
    return null
  }

  async findByStatus(status: PropertyStatus): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.status === status)
  }

  async findExpiringTrials(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => {
      if (!p.trialPeriod || p.status !== PropertyStatus.ACTIVE) return false
      return p.trialPeriod.daysRemaining() === 2
    })
  }

  async findExpiredTrials(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => {
      if (!p.trialPeriod || p.status !== PropertyStatus.ACTIVE) return false
      return p.trialPeriod.daysRemaining() < 0
    })
  }

  async findCadasturExpiring(days: number = 30): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => {
      if (!p.cadastur) return false
      return p.cadastur.isExpiringSoon(days)
    })
  }

  async findCadasturExpired(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => {
      if (!p.cadastur) return false
      return p.cadastur.status.toString() === 'EXPIRED'
    })
  }

  async findSuspended(): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.status === PropertyStatus.SUSPENDED)
  }

  async count(filters?: PropertyFilters): Promise<number> {
    let result = Array.from(this.properties.values())

    if (filters) {
      if (filters.status) result = result.filter(p => p.status === filters.status)
      if (filters.plan) result = result.filter(p => p.plan === filters.plan)
      if (filters.isCanary !== undefined) result = result.filter(p => p.isCanary === filters.isCanary)
      if (filters.search) {
        const search = filters.search.toLowerCase()
        result = result.filter(p => p.name.toLowerCase().includes(search) || p.slug.includes(search))
      }
    }

    return result.length
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const found = await this.findBySlug(slug)
    return found !== null
  }

  clear(): void {
    this.properties.clear()
  }
}
