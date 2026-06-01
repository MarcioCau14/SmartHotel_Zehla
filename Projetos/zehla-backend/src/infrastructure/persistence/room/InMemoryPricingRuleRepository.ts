import { PricingRule } from '../../../domain/room/entities/PricingRule'
import { IPricingRuleRepository } from '../../../application/room/ports/IPricingRuleRepository'

export class InMemoryPricingRuleRepository implements IPricingRuleRepository {
  private rules = new Map<string, PricingRule>()

  async save(rule: PricingRule): Promise<PricingRule> {
    this.rules.set(rule.id, rule)
    return rule
  }

  async update(rule: PricingRule): Promise<PricingRule> {
    this.rules.set(rule.id, rule)
    return rule
  }

  async findById(id: string): Promise<PricingRule | null> {
    return this.rules.get(id) ?? null
  }

  async findByProperty(propertyId: string): Promise<PricingRule[]> {
    return Array.from(this.rules.values()).filter((r) => r.propertyId === propertyId)
  }

  async findActiveByDate(propertyId: string, date: Date): Promise<PricingRule[]> {
    return Array.from(this.rules.values()).filter(
      (r) => r.propertyId === propertyId && r.isActiveOn(date)
    )
  }

  async findConflicting(rule: PricingRule): Promise<PricingRule | null> {
    for (const existing of this.rules.values()) {
      if (existing.id === rule.id) continue
      if (rule.conflictsWith(existing)) return existing
    }
    return null
  }

  async delete(id: string): Promise<void> {
    this.rules.delete(id)
  }

  clear(): void {
    this.rules.clear()
  }
}
