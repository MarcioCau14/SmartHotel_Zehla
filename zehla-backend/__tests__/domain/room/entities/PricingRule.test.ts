import { describe, it, expect } from 'vitest'
import { PricingRule } from '../../../../src/domain/room/entities/PricingRule'
import { MonetaryValue } from '../../../../src/domain/room/value-objects/MonetaryValue'
import { RoomDateRange } from '../../../../src/domain/room/value-objects/RoomDateRange'
import { RoomType } from '../../../../src/domain/room/enums'

function makeRange(start: string, end: string) {
  return RoomDateRange.create(new Date(start), new Date(end)).value
}

describe('PricingRule', () => {
  it('should create valid pricing rule', () => {
    const rule = PricingRule.create({
      id: 'rule-1',
      name: 'Réveillon',
      roomType: RoomType.SUITE,
      dateRange: makeRange('2025-12-28', '2026-01-02'),
      multiplier: 2.0,
      propertyId: 'prop-1',
    })
    expect(rule.isOk).toBe(true)
    expect(rule.value.name).toBe('Réveillon')
    expect(rule.value.roomType).toBe(RoomType.SUITE)
    expect(rule.value.multiplier).toBe(2.0)
    expect(rule.value.isActive).toBe(true)
  })

  it('should create rule without roomType (applies to all)', () => {
    const rule = PricingRule.create({
      id: 'rule-2',
      name: 'Feriado Geral',
      dateRange: makeRange('2025-11-15', '2025-11-17'),
      propertyId: 'prop-1',
    })
    expect(rule.isOk).toBe(true)
    expect(rule.value.roomType).toBeNull()
  })

  it('should fail with multiplier < 0.5', () => {
    const rule = PricingRule.create({
      id: 'rule-3',
      name: 'Desconto',
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      multiplier: 0.3,
      propertyId: 'prop-1',
    })
    expect(rule.isFail).toBe(true)
    expect(rule.error).toContain('0.5')
  })

  it('should fail with very large multiplier', () => {
    const rule = PricingRule.create({
      id: 'rule-4',
      name: 'Super Faturamento',
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      multiplier: 200,
      propertyId: 'prop-1',
    })
    expect(rule.isFail).toBe(true)
  })

  it('should fail with empty name', () => {
    const rule = PricingRule.create({
      id: 'rule-5',
      name: '  ',
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      propertyId: 'prop-1',
    })
    expect(rule.isFail).toBe(true)
  })

  it('should apply multiplier to base price', () => {
    const rule = PricingRule.create({
      id: 'rule-6',
      name: 'Réveillon',
      dateRange: makeRange('2025-12-28', '2026-01-02'),
      multiplier: 2.0,
      propertyId: 'prop-1',
    }).value
    const base = MonetaryValue.create(200).value
    const result = rule.applyTo(base)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(400)
  })

  it('should use fixedAmount when defined', () => {
    const rule = PricingRule.create({
      id: 'rule-7',
      name: 'Réveillon Fixo',
      dateRange: makeRange('2025-12-28', '2026-01-02'),
      fixedAmount: MonetaryValue.create(1500).value,
      propertyId: 'prop-1',
    }).value
    const base = MonetaryValue.create(200).value
    const result = rule.applyTo(base)
    expect(result.isOk).toBe(true)
    expect(result.value.amount).toBe(1500)
  })

  it('should return base price when no active rule matches', () => {
    const rule = PricingRule.create({
      id: 'rule-8',
      name: 'Regra Futura',
      dateRange: makeRange('2026-12-28', '2027-01-02'),
      multiplier: 3.0,
      propertyId: 'prop-1',
    }).value
    const base = MonetaryValue.create(200).value
    expect(rule.isActiveOn(new Date('2025-06-01'))).toBe(false)
  })

  it('should detect isActiveOn date', () => {
    const rule = PricingRule.create({
      id: 'rule-9',
      name: 'Alta Temporada',
      dateRange: makeRange('2025-12-01', '2026-02-28'),
      propertyId: 'prop-1',
    }).value
    expect(rule.isActiveOn(new Date('2025-12-25'))).toBe(true)
    expect(rule.isActiveOn(new Date('2025-06-01'))).toBe(false)
  })

  it('should detect conflicts with overlapping rules of same type', () => {
    const rule1 = PricingRule.create({
      id: 'rule-10',
      name: 'Alta 1',
      dateRange: makeRange('2025-12-01', '2025-12-31'),
      roomType: RoomType.SUITE,
      propertyId: 'prop-1',
    }).value
    const rule2 = PricingRule.create({
      id: 'rule-11',
      name: 'Alta 2',
      dateRange: makeRange('2025-12-15', '2026-01-15'),
      roomType: RoomType.SUITE,
      propertyId: 'prop-1',
    }).value
    expect(rule1.conflictsWith(rule2)).toBe(true)
  })

  it('should not detect conflicts with different room types', () => {
    const rule1 = PricingRule.create({
      id: 'rule-12',
      name: 'Suites',
      dateRange: makeRange('2025-12-01', '2025-12-31'),
      roomType: RoomType.SUITE,
      propertyId: 'prop-1',
    }).value
    const rule2 = PricingRule.create({
      id: 'rule-13',
      name: 'Standard',
      dateRange: makeRange('2025-12-15', '2026-01-15'),
      roomType: RoomType.STANDARD,
      propertyId: 'prop-1',
    }).value
    expect(rule1.conflictsWith(rule2)).toBe(false)
  })

  it('should deactivate rule', () => {
    const rule = PricingRule.create({
      id: 'rule-14',
      name: 'Temporária',
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      propertyId: 'prop-1',
    }).value
    expect(rule.isActive).toBe(true)
    rule.deactivate()
    expect(rule.isActive).toBe(false)
  })

  it('should fail applyTo when rule is inactive', () => {
    const rule = PricingRule.create({
      id: 'rule-15',
      name: 'Inativa',
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      propertyId: 'prop-1',
    }).value
    rule.deactivate()
    const result = rule.applyTo(MonetaryValue.create(200).value)
    expect(result.isFail).toBe(true)
    expect(result.error).toContain('inativa')
  })

  it('should check if applies to room type', () => {
    const allTypes = PricingRule.create({
      id: 'rule-16',
      name: 'Geral',
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      propertyId: 'prop-1',
    }).value
    const onlySuite = PricingRule.create({
      id: 'rule-17',
      name: 'Suítes',
      roomType: RoomType.SUITE,
      dateRange: makeRange('2025-06-01', '2025-06-05'),
      propertyId: 'prop-1',
    }).value
    expect(allTypes.appliesTo(RoomType.STANDARD)).toBe(true)
    expect(onlySuite.appliesTo(RoomType.STANDARD)).toBe(false)
    expect(onlySuite.appliesTo(RoomType.SUITE)).toBe(true)
  })
})
