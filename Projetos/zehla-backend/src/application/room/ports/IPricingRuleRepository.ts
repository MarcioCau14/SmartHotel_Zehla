import { PricingRule } from '../../../domain/room/entities/PricingRule'

export interface IPricingRuleRepository {
  save(rule: PricingRule): Promise<PricingRule>
  update(rule: PricingRule): Promise<PricingRule>
  findById(id: string): Promise<PricingRule | null>
  findByProperty(propertyId: string): Promise<PricingRule[]>
  findActiveByDate(propertyId: string, date: Date): Promise<PricingRule[]>
  findConflicting(rule: PricingRule): Promise<PricingRule | null>
  delete(id: string): Promise<void>
}
